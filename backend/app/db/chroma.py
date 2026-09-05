from __future__ import annotations

import math
import os
from typing import Any, Optional
from uuid import UUID

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    _CHROMA_AVAILABLE = True
except ImportError:
    _CHROMA_AVAILABLE = False

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("db.chroma")


class _InMemoryVectorStore:
    """Fallback in-memory cosine vector store when ChromaDB is not installed or in lightweight test mode."""

    def __init__(self) -> None:
        self.records: dict[str, dict[str, Any]] = {}

    def add(
        self,
        ids: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
        documents: list[str],
    ) -> None:
        for doc_id, emb, meta, doc in zip(ids, embeddings, metadatas, documents):
            self.records[doc_id] = {
                "id": doc_id,
                "embedding": emb,
                "metadata": meta,
                "document": doc,
            }

    def query(
        self,
        query_embeddings: list[list[float]],
        n_results: int = 20,
        where: Optional[dict] = None,
        include: Optional[list[str]] = None,
    ) -> dict[str, list]:
        if not query_embeddings or not self.records:
            return {"ids": [[]], "distances": [[]], "metadatas": [[]]}

        q_emb = query_embeddings[0]
        q_norm = math.sqrt(sum(x * x for x in q_emb)) or 1e-9

        scored: list[tuple[float, str, dict]] = []
        for doc_id, item in self.records.items():
            meta = item["metadata"]
            if where:
                match = True
                for k, v in where.items():
                    if str(meta.get(k)) != str(v):
                        match = False
                        break
                if not match:
                    continue

            d_emb = item["embedding"]
            d_norm = math.sqrt(sum(x * x for x in d_emb)) or 1e-9
            dot = sum(a * b for a, b in zip(q_emb, d_emb))
            cosine_sim = dot / (q_norm * d_norm)
            cosine_dist = max(0.0, 1.0 - cosine_sim)
            scored.append((cosine_dist, doc_id, meta))

        scored.sort(key=lambda x: x[0])
        top = scored[:n_results]

        return {
            "ids": [[item[1] for item in top]],
            "distances": [[item[0] for item in top]],
            "metadatas": [[item[2] for item in top]],
        }

    def delete(self, where: Optional[dict] = None) -> None:
        if not where:
            self.records.clear()
            return
        to_delete = []
        for doc_id, item in self.records.items():
            meta = item["metadata"]
            match = True
            for k, v in where.items():
                if str(meta.get(k)) != str(v):
                    match = False
                    break
            if match:
                to_delete.append(doc_id)
        for doc_id in to_delete:
            self.records.pop(doc_id, None)

    def count(self) -> int:
        return len(self.records)


class ChromaRepository:
    """
    Clean repository abstraction for ChromaDB operations.
    Handles vector storage, metadata filtering, and cosine similarity search.
    """

    _client = None
    _collection = None
    _fallback_store: Optional[_InMemoryVectorStore] = None

    @classmethod
    def get_client(cls):
        if not _CHROMA_AVAILABLE:
            return None
        if cls._client is None:
            try:
                os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
                cls._client = chromadb.PersistentClient(
                    path=settings.CHROMA_PERSIST_DIR,
                    settings=ChromaSettings(anonymized_telemetry=False),
                )
            except Exception as exc:
                logger.warning("chroma.client_init_failed", error=str(exc))
                cls._client = None
        return cls._client

    @classmethod
    def get_collection(cls):
        client = cls.get_client()
        if client is not None:
            if cls._collection is None:
                # Always fetch fresh from client to avoid stale in-process cache
                try:
                    cls._collection = client.get_or_create_collection(
                        name=settings.CHROMA_COLLECTION_NAME,
                        metadata={"hnsw:space": "cosine"},
                    )
                except Exception as exc:
                    logger.error("chroma.get_collection_failed", error=str(exc))
                    cls._collection = None
                    return cls._get_fallback()
            return cls._collection

        return cls._get_fallback()

    @classmethod
    def _get_fallback(cls):
        if cls._fallback_store is None:
            cls._fallback_store = _InMemoryVectorStore()
        return cls._fallback_store

    @classmethod
    def reset_collection(cls):
        """Delete and recreate the ChromaDB collection (e.g. after dimension mismatch)."""
        client = cls.get_client()
        if client is None:
            return
        try:
            client.delete_collection(settings.CHROMA_COLLECTION_NAME)
        except Exception:
            pass
        cls._collection = client.create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.warning("chroma.collection_reset", reason="dimension_mismatch_recovery")

    @classmethod
    def insert_batch(
        cls,
        ids: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
        documents: list[str],
    ):
        """Batch insert chunks with metadata into Chroma."""
        coll = cls.get_collection()
        try:
            coll.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas,
                documents=documents,
            )
            logger.info("chroma.insert_batch", count=len(ids))
        except Exception as exc:
            err_str = str(exc).lower()
            # Auto-recover from dimension mismatch (stale collection from a
            # previous embedding model with different output size)
            if "dimension" in err_str or "embedding" in err_str:
                logger.warning(
                    "chroma.dimension_mismatch_detected",
                    error=str(exc),
                    action="resetting_collection",
                )
                cls.reset_collection()
                coll = cls.get_collection()
                coll.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    documents=documents,
                )
                logger.info("chroma.insert_batch_after_reset", count=len(ids))
            else:
                logger.error("chroma.insert_batch.failed", error=str(exc))
                raise

    @classmethod
    def similarity_search(
        cls,
        query_embedding: list[float],
        top_k: int = 20,
        machine_id: UUID | None = None,
        manual_id: UUID | None = None,
    ) -> dict[str, list]:
        """Top-K Cosine Similarity search with optional metadata filtering."""
        coll = cls.get_collection()
        where_filter = {}
        if machine_id and manual_id:
            where_filter["$and"] = [
                {"machine_id": str(machine_id)},
                {"manual_id": str(manual_id)},
            ]
        elif machine_id:
            where_filter["machine_id"] = str(machine_id)
        elif manual_id:
            where_filter["manual_id"] = str(manual_id)

        try:
            results = coll.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter if where_filter else None,
                include=["metadatas", "distances"],
            )
            return results
        except Exception as exc:
            logger.error("chroma.search.failed", error=str(exc))
            return {"ids": [], "distances": [], "metadatas": []}

    @classmethod
    def delete_by_manual_id(cls, manual_id: UUID | str):
        """Delete all vectors for a given manual_id."""
        coll = cls.get_collection()
        try:
            coll.delete(where={"manual_id": str(manual_id)})
            logger.info("chroma.deleted_manual", manual_id=str(manual_id))
        except Exception as exc:
            logger.error("chroma.delete_manual.failed", error=str(exc))

    @classmethod
    def get_count(cls) -> int:
        """Get total number of vectors in collection."""
        coll = cls.get_collection()
        try:
            if hasattr(coll, "count"):
                return coll.count()
            return 0
        except Exception:
            return 0
