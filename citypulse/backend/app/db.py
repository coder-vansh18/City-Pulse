import sqlite3
import json
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.config import settings

class Database:
    def __init__(self, db_path: str = settings.DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY,
                    source TEXT,
                    feed TEXT,
                    zone_id TEXT,
                    lat REAL,
                    lng REAL,
                    severity REAL,
                    value REAL,
                    unit TEXT,
                    title TEXT,
                    description TEXT,
                    timestamp TEXT,
                    received_at TEXT,
                    confidence REAL,
                    status TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_zone ON events(zone_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_feed ON events(feed)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS insights (
                    id TEXT PRIMARY KEY,
                    kind TEXT,
                    zone_ids TEXT,
                    feed_types TEXT,
                    severity REAL,
                    confidence TEXT,
                    title TEXT,
                    plain_text TEXT,
                    caveat TEXT,
                    evidence TEXT,
                    event_ids TEXT,
                    window_start TEXT,
                    window_end TEXT,
                    first_seen TEXT,
                    status TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id TEXT PRIMARY KEY,
                    rule_id TEXT,
                    level TEXT,
                    zone_id TEXT,
                    title TEXT,
                    message TEXT,
                    created_at TEXT,
                    acknowledged INTEGER DEFAULT 0
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS alert_rules (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    metric TEXT,
                    zone_id TEXT,
                    operator TEXT,
                    threshold REAL,
                    enabled INTEGER DEFAULT 1,
                    cooldown_s INTEGER DEFAULT 120
                )
            """)

            # Seed default alert rules if not present
            cursor.execute("SELECT COUNT(*) as cnt FROM alert_rules")
            if cursor.fetchone()["cnt"] == 0:
                default_rules = [
                    ("rule_pulse_critical", "Critical Zone Pulse Score", "pulse_score", None, "<", 45.0, 1, 120),
                    ("rule_anomaly_high", "High Severity Anomaly Detected", "anomaly_severity", None, ">", 0.70, 1, 90),
                    ("rule_feed_offline", "Civic Feed Ingestion Disruption", "feed_down", None, ">", 60.0, 1, 180),
                ]
                cursor.executemany("""
                    INSERT INTO alert_rules (id, name, metric, zone_id, operator, threshold, enabled, cooldown_s)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, default_rules)

            conn.commit()

    def insert_event(self, event_data: Dict[str, Any]):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO events 
                (id, source, feed, zone_id, lat, lng, severity, value, unit, title, description, timestamp, received_at, confidence, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event_data["id"],
                event_data["source"],
                event_data["feed"],
                event_data["zone_id"],
                event_data["lat"],
                event_data["lng"],
                event_data["severity"],
                event_data.get("value"),
                event_data.get("unit"),
                event_data["title"],
                event_data.get("description"),
                event_data["timestamp"],
                event_data["received_at"],
                event_data["confidence"],
                event_data.get("status", "active")
            ))
            conn.commit()

    def insert_events_batch(self, events: List[Dict[str, Any]]):
        if not events:
            return
        with self._get_conn() as conn:
            cursor = conn.cursor()
            records = [
                (
                    e["id"], e["source"], e["feed"], e["zone_id"], e["lat"], e["lng"],
                    e["severity"], e.get("value"), e.get("unit"), e["title"],
                    e.get("description"), e["timestamp"], e["received_at"],
                    e["confidence"], e.get("status", "active")
                )
                for e in events
            ]
            cursor.executemany("""
                INSERT OR REPLACE INTO events 
                (id, source, feed, zone_id, lat, lng, severity, value, unit, title, description, timestamp, received_at, confidence, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, records)
            conn.commit()

    def get_events(self, feed: Optional[str] = None, zone_id: Optional[str] = None, since: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        query = "SELECT * FROM events WHERE 1=1"
        params = []
        if feed:
            query += " AND feed = ?"
            params.append(feed)
        if zone_id:
            query += " AND zone_id = ?"
            params.append(zone_id)
        if since:
            query += " AND timestamp >= ?"
            params.append(since)
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def upsert_insight(self, insight_data: Dict[str, Any]):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO insights
                (id, kind, zone_ids, feed_types, severity, confidence, title, plain_text, caveat, evidence, event_ids, window_start, window_end, first_seen, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                insight_data["id"],
                insight_data["kind"],
                json.dumps(insight_data["zone_ids"]),
                json.dumps(insight_data["feed_types"]),
                insight_data["severity"],
                insight_data["confidence"],
                insight_data["title"],
                insight_data["plain_text"],
                insight_data.get("caveat"),
                json.dumps(insight_data.get("evidence", [])),
                json.dumps(insight_data.get("event_ids", [])),
                insight_data["window_start"],
                insight_data["window_end"],
                insight_data["first_seen"],
                insight_data.get("status", "active")
            ))
            conn.commit()

    def get_insights(self, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        query = "SELECT * FROM insights"
        params = []
        if status and status != "all":
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY window_end DESC LIMIT ?"
        params.append(limit)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for row in rows:
                d = dict(row)
                d["zone_ids"] = json.loads(d["zone_ids"])
                d["feed_types"] = json.loads(d["feed_types"])
                d["evidence"] = json.loads(d["evidence"]) if d["evidence"] else []
                d["event_ids"] = json.loads(d["event_ids"]) if d["event_ids"] else []
                results.append(d)
            return results

    def get_alerts(self, acknowledged: Optional[bool] = None, limit: int = 50) -> List[Dict[str, Any]]:
        query = "SELECT * FROM alerts"
        params = []
        if acknowledged is not None:
            query += " WHERE acknowledged = ?"
            params.append(1 if acknowledged else 0)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "rule_id": r["rule_id"],
                    "level": r["level"],
                    "zone_id": r["zone_id"],
                    "title": r["title"],
                    "message": r["message"],
                    "created_at": r["created_at"],
                    "acknowledged": bool(r["acknowledged"])
                }
                for r in rows
            ]

    def insert_alert(self, alert_data: Dict[str, Any]):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO alerts (id, rule_id, level, zone_id, title, message, created_at, acknowledged)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert_data["id"],
                alert_data["rule_id"],
                alert_data["level"],
                alert_data.get("zone_id"),
                alert_data["title"],
                alert_data["message"],
                alert_data["created_at"],
                1 if alert_data.get("acknowledged") else 0
            ))
            conn.commit()

    def acknowledge_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))
            conn.commit()
            cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d["acknowledged"] = bool(d["acknowledged"])
                return d
            return None

    def get_alert_rules(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alert_rules")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "metric": r["metric"],
                    "zone_id": r["zone_id"],
                    "operator": r["operator"],
                    "threshold": r["threshold"],
                    "enabled": bool(r["enabled"]),
                    "cooldown_s": r["cooldown_s"]
                }
                for r in rows
            ]

    def insert_alert_rule(self, rule_data: Dict[str, Any]):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO alert_rules (id, name, metric, zone_id, operator, threshold, enabled, cooldown_s)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rule_data["id"],
                rule_data["name"],
                rule_data["metric"],
                rule_data.get("zone_id"),
                rule_data["operator"],
                rule_data["threshold"],
                1 if rule_data.get("enabled", True) else 0,
                rule_data.get("cooldown_s", 120)
            ))
            conn.commit()

    def update_alert_rule(self, rule_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alert_rules WHERE id = ?", (rule_id,))
            existing = cursor.fetchone()
            if not existing:
                return None
            d = dict(existing)
            d.update(updates)
            cursor.execute("""
                UPDATE alert_rules SET name=?, metric=?, zone_id=?, operator=?, threshold=?, enabled=?, cooldown_s=?
                WHERE id = ?
            """, (
                d["name"], d["metric"], d.get("zone_id"), d["operator"], d["threshold"],
                1 if d["enabled"] else 0, d["cooldown_s"], rule_id
            ))
            conn.commit()
            d["enabled"] = bool(d["enabled"])
            return d

    def delete_alert_rule(self, rule_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM alert_rules WHERE id = ?", (rule_id,))
            conn.commit()
            return cursor.rowcount > 0

db = Database()
