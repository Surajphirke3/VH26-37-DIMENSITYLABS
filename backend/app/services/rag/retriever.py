from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.db.chroma import ChromaRepository

logger = get_logger("rag.retriever")


@dataclass
class RetrievedChunk:
    chunk_id: UUID
    manual_id: UUID
    machine_id: UUID
    content: str
    chunk_type: str
    page_start: int
    page_end: int
    section_path: str
    error_codes_present: list[str]
    rrf_score: float
    machine_name: str = ""
    manual_name: str = ""


class HybridRetriever:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def retrieve(
        self,
        query_embedding: list[float],
        query_text: str,
        machine_id: UUID | None = None,
        top_k: int | None = None,
    ) -> list[tuple[UUID, float]]:
        """Return RRF-fused (chunk_id, score) list from ChromaDB and keyword search."""
        actual_top_k = top_k or settings.INITIAL_TOP_K
        vector_results = await self._vector_search(query_embedding, machine_id, actual_top_k)
        keyword_results = await self._keyword_search(query_text, machine_id, actual_top_k)
        return self._rrf_fuse(vector_results, keyword_results, actual_top_k)

    async def _vector_search(
        self,
        embedding: list[float],
        machine_id: UUID | None,
        top_k: int,
    ) -> list[tuple[UUID, float]]:
        """Query pgvector in PostgreSQL using Cosine Similarity (with fallback to ChromaDB)."""
        target_uuid = None
        if machine_id:
            if isinstance(machine_id, UUID):
                target_uuid = machine_id
            else:
                try:
                    target_uuid = UUID(str(machine_id))
                except (ValueError, TypeError):
                    target_uuid = None

        try:
            emb_str = "[" + ",".join(str(x) for x in embedding) + "]"
            machine_filter = "AND machine_id = :machine_id" if target_uuid else ""
            sql = text(f"""
                SELECT id, 1 - (embedding <=> CAST(:emb AS vector)) as similarity
                FROM chunks
                WHERE embedding IS NOT NULL {machine_filter}
                ORDER BY embedding <=> CAST(:emb AS vector)
                LIMIT :top_k
            """)
            params = {"emb": emb_str, "top_k": top_k}
            if target_uuid:
                params["machine_id"] = target_uuid
            res = await self.db.execute(sql, params)
            rows = res.fetchall()
            if rows:
                return [(row[0], float(row[1])) for row in rows]
        except Exception as exc:
            logger.warning("retriever.pgvector_search.failed", error=str(exc))

        # Fallback to ChromaDB if Postgres vector search fails or is empty
        try:
            res = ChromaRepository.similarity_search(
                query_embedding=embedding,
                top_k=top_k,
                machine_id=target_uuid,
            )
            ids = res.get("ids", [[]])[0]
            distances = res.get("distances", [[]])[0]
            return [(UUID(chunk_id), 1.0 - float(distances[i])) for i, chunk_id in enumerate(ids)]
        except Exception as exc:
            logger.error("retriever.vector_search.failed", error=str(exc))
            return []

    async def _keyword_search(
        self,
        query: str,
        machine_id: UUID | None,
        top_k: int,
    ) -> list[tuple[UUID, float]]:
        """Postgres TSVector keyword search with websearch syntax."""
        target_uuid = None
        if machine_id:
            if isinstance(machine_id, UUID):
                target_uuid = machine_id
            else:
                try:
                    target_uuid = UUID(str(machine_id))
                except (ValueError, TypeError):
                    target_uuid = None

        machine_filter = "AND c.machine_id = :machine_id" if target_uuid else ""
        sql = text(f"""
            SELECT c.id,
                   ts_rank(to_tsvector('english', c.content),
                           websearch_to_tsquery('english', :query)) AS score
            FROM chunks c
            WHERE to_tsvector('english', c.content)
                  @@ websearch_to_tsquery('english', :query) {machine_filter}
            ORDER BY score DESC
            LIMIT :top_k
        """)
        params: dict = {"query": query, "top_k": top_k}
        if target_uuid:
            params["machine_id"] = target_uuid
        try:
            result = await self.db.execute(sql, params)
            rows = result.fetchall()
            if rows:
                return [(row[0], float(row[1])) for row in rows]
        except Exception as exc:
            logger.debug("retriever.keyword_search.websearch_fallback", error=str(exc))

        # Fallback to plainto_tsquery if websearch syntax fails
        try:
            fallback_sql = text(f"""
                SELECT c.id,
                       ts_rank(to_tsvector('english', c.content),
                               plainto_tsquery('english', :query)) AS score
                FROM chunks c
                WHERE to_tsvector('english', c.content)
                      @@ plainto_tsquery('english', :query) {machine_filter}
                ORDER BY score DESC
                LIMIT :top_k
            """)
            result = await self.db.execute(fallback_sql, params)
            rows = result.fetchall()
            if rows:
                return [(row[0], float(row[1])) for row in rows]
        except Exception as exc:
            logger.warning("retriever.keyword_search.fallback_failed", error=str(exc))

        # Fallback 2: Alphanumeric ILIKE search for non-English manuals (e.g. Chinese)
        # where Postgres 'english' tsvector does not segment Chinese characters.
        import re
        tokens = re.findall(r'[A-Za-z0-9\-\.]+', query)
        code_tokens = [t for t in tokens if t.lower() not in ('alarm', 'error', 'code', 'the', 'is', 'in', 'and', 'what', 'how', 'to', 'fix')]
        if code_tokens:
            ilike_clauses = " OR ".join(f"c.content ILIKE :tok_{i}" for i in range(len(code_tokens)))
            ilike_sql = text(f"""
                SELECT c.id, 1.0 AS score
                FROM chunks c
                WHERE ({ilike_clauses}) {machine_filter}
                ORDER BY (CASE WHEN c.content ILIKE '%报警%' OR c.content ILIKE '%alarm%' OR c.content ILIKE '%error%' THEN 0 ELSE 1 END) ASC
                LIMIT :top_k
            """)
            ilike_params = {f"tok_{i}": f"%{t}%" for i, t in enumerate(code_tokens)}
            ilike_params["top_k"] = top_k
            if target_uuid:
                ilike_params["machine_id"] = target_uuid
            try:
                res = await self.db.execute(ilike_sql, ilike_params)
                ilike_rows = res.fetchall()
                if ilike_rows:
                    return [(row[0], float(row[1])) for row in ilike_rows]
            except Exception as exc:
                logger.warning("retriever.keyword_search.ilike_failed", error=str(exc))

        return []

    def _rrf_fuse(
        self,
        vec: list[tuple[UUID, float]],
        kw: list[tuple[UUID, float]],
        top_k: int,
        k: int = 60,
    ) -> list[tuple[UUID, float]]:
        scores: dict[UUID, float] = {}
        for rank, (chunk_id, _) in enumerate(vec):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1 / (k + rank + 1)
        for rank, (chunk_id, _) in enumerate(kw):
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1 / (k + rank + 1)
        sorted_ids = sorted(scores, key=lambda x: scores[x], reverse=True)[:top_k]
        return [(cid, scores[cid]) for cid in sorted_ids]

    async def fetch_chunks(
        self, chunk_scores: list[tuple[UUID, float]]
    ) -> list[RetrievedChunk]:
        """Hydrate chunk rows from the DB and attach RRF scores."""
        if not chunk_scores:
            return []
        ids = [str(cid) for cid, _ in chunk_scores]
        score_map: dict = {cid: score for cid, score in chunk_scores}
        sql = text("""
            SELECT c.id, c.manual_id, c.machine_id, c.content, c.chunk_type,
                   c.page_start, c.page_end, c.section_path, c.error_codes_present,
                   m.title  AS manual_name,
                   mc.name  AS machine_name
            FROM   chunks c
            LEFT JOIN manuals  m  ON c.manual_id  = m.id
            LEFT JOIN machines mc ON c.machine_id = mc.id
            WHERE  c.id::text = ANY(:ids)
        """)
        result = await self.db.execute(sql, {"ids": ids})
        chunks: list[RetrievedChunk] = []
        for row in result.fetchall():
            chunks.append(RetrievedChunk(
                chunk_id=row[0],
                manual_id=row[1],
                machine_id=row[2],
                content=row[3],
                chunk_type=row[4],
                page_start=row[5],
                page_end=row[6],
                section_path=row[7],
                error_codes_present=row[8] or [],
                rrf_score=score_map.get(row[0], 0.0),
                manual_name=row[9],
                machine_name=row[10],
            ))
        chunks.sort(key=lambda x: x.rrf_score, reverse=True)
        return chunks
