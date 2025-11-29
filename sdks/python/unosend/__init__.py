"""
Unosend Python SDK
Official SDK for the Unosend Email API
"""

from .client import Unosend
from .types import (
    Email,
    Domain,
    DnsRecord,
    Audience,
    Contact,
    SendEmailOptions,
    UnosendError,
)

__version__ = "1.0.0"
__all__ = [
    "Unosend",
    "Email",
    "Domain",
    "DnsRecord",
    "Audience",
    "Contact",
    "SendEmailOptions",
    "UnosendError",
]
