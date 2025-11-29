"""Type definitions for Unosend SDK"""

from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime


@dataclass
class UnosendError:
    """Error returned from Unosend API"""
    message: str
    code: int
    status_code: Optional[int] = None


@dataclass
class SendEmailOptions:
    """Options for sending an email"""
    from_address: str
    to: List[str]
    subject: str
    html: Optional[str] = None
    text: Optional[str] = None
    reply_to: Optional[str] = None
    cc: Optional[List[str]] = None
    bcc: Optional[List[str]] = None
    headers: Optional[Dict[str, str]] = None
    tags: Optional[List[Dict[str, str]]] = None


@dataclass
class Email:
    """Email object"""
    id: str
    from_address: str
    to: List[str]
    subject: str
    status: str
    created_at: str

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Email":
        return cls(
            id=data.get("id", ""),
            from_address=data.get("from", ""),
            to=data.get("to", []),
            subject=data.get("subject", ""),
            status=data.get("status", ""),
            created_at=data.get("createdAt", ""),
        )


@dataclass
class DnsRecord:
    """DNS record for domain verification"""
    type: str
    name: str
    value: str
    ttl: int

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DnsRecord":
        return cls(
            type=data.get("type", ""),
            name=data.get("name", ""),
            value=data.get("value", ""),
            ttl=data.get("ttl", 0),
        )


@dataclass
class Domain:
    """Domain object"""
    id: str
    name: str
    status: str
    records: List[DnsRecord]
    created_at: str

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Domain":
        records = [DnsRecord.from_dict(r) for r in data.get("records", [])]
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            status=data.get("status", ""),
            records=records,
            created_at=data.get("createdAt", ""),
        )


@dataclass
class Audience:
    """Audience object"""
    id: str
    name: str
    contact_count: int
    created_at: str

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Audience":
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            contact_count=data.get("contactCount", 0),
            created_at=data.get("createdAt", ""),
        )


@dataclass
class Contact:
    """Contact object"""
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    unsubscribed: bool
    created_at: str

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Contact":
        return cls(
            id=data.get("id", ""),
            email=data.get("email", ""),
            first_name=data.get("firstName"),
            last_name=data.get("lastName"),
            unsubscribed=data.get("unsubscribed", False),
            created_at=data.get("createdAt", ""),
        )
