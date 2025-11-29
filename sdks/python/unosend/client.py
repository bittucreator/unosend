"""Unosend Python SDK Client"""

from typing import Optional, List, Dict, Any, Tuple, Union
import httpx

from .types import Email, Domain, Audience, Contact, UnosendError


class ApiResponse:
    """Wrapper for API responses"""
    def __init__(self, data: Any = None, error: Optional[UnosendError] = None):
        self.data = data
        self.error = error

    def __iter__(self):
        return iter((self.data, self.error))


class Emails:
    """Email operations"""

    def __init__(self, client: "Unosend"):
        self._client = client

    def send(
        self,
        *,
        from_address: str,
        to: Union[str, List[str]],
        subject: str,
        html: Optional[str] = None,
        text: Optional[str] = None,
        reply_to: Optional[str] = None,
        cc: Optional[Union[str, List[str]]] = None,
        bcc: Optional[Union[str, List[str]]] = None,
        headers: Optional[Dict[str, str]] = None,
        tags: Optional[List[Dict[str, str]]] = None,
    ) -> ApiResponse:
        """Send an email"""
        to_list = [to] if isinstance(to, str) else to
        cc_list = [cc] if isinstance(cc, str) else cc
        bcc_list = [bcc] if isinstance(bcc, str) else bcc

        payload = {
            "from": from_address,
            "to": to_list,
            "subject": subject,
        }

        if html:
            payload["html"] = html
        if text:
            payload["text"] = text
        if reply_to:
            payload["replyTo"] = reply_to
        if cc_list:
            payload["cc"] = cc_list
        if bcc_list:
            payload["bcc"] = bcc_list
        if headers:
            payload["headers"] = headers
        if tags:
            payload["tags"] = tags

        data, error = self._client._request("POST", "/emails", payload)
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Email.from_dict(data))

    def get(self, email_id: str) -> ApiResponse:
        """Get an email by ID"""
        data, error = self._client._request("GET", f"/emails/{email_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Email.from_dict(data))

    def list(self, *, limit: int = 10, offset: int = 0) -> ApiResponse:
        """List emails"""
        data, error = self._client._request(
            "GET", f"/emails?limit={limit}&offset={offset}"
        )
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=[Email.from_dict(e) for e in data])


class Domains:
    """Domain operations"""

    def __init__(self, client: "Unosend"):
        self._client = client

    def create(self, name: str) -> ApiResponse:
        """Add a domain"""
        data, error = self._client._request("POST", "/domains", {"name": name})
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Domain.from_dict(data))

    def get(self, domain_id: str) -> ApiResponse:
        """Get a domain by ID"""
        data, error = self._client._request("GET", f"/domains/{domain_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Domain.from_dict(data))

    def list(self) -> ApiResponse:
        """List all domains"""
        data, error = self._client._request("GET", "/domains")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=[Domain.from_dict(d) for d in data])

    def verify(self, domain_id: str) -> ApiResponse:
        """Verify domain DNS records"""
        data, error = self._client._request("POST", f"/domains/{domain_id}/verify")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Domain.from_dict(data))

    def delete(self, domain_id: str) -> ApiResponse:
        """Delete a domain"""
        data, error = self._client._request("DELETE", f"/domains/{domain_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=data)


class Audiences:
    """Audience operations"""

    def __init__(self, client: "Unosend"):
        self._client = client

    def create(self, name: str) -> ApiResponse:
        """Create an audience"""
        data, error = self._client._request("POST", "/audiences", {"name": name})
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Audience.from_dict(data))

    def get(self, audience_id: str) -> ApiResponse:
        """Get an audience by ID"""
        data, error = self._client._request("GET", f"/audiences/{audience_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Audience.from_dict(data))

    def list(self) -> ApiResponse:
        """List all audiences"""
        data, error = self._client._request("GET", "/audiences")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=[Audience.from_dict(a) for a in data])

    def delete(self, audience_id: str) -> ApiResponse:
        """Delete an audience"""
        data, error = self._client._request("DELETE", f"/audiences/{audience_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=data)


class Contacts:
    """Contact operations"""

    def __init__(self, client: "Unosend"):
        self._client = client

    def create(
        self,
        audience_id: str,
        *,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
    ) -> ApiResponse:
        """Create a contact"""
        payload: Dict[str, Any] = {"audienceId": audience_id, "email": email}
        if first_name:
            payload["firstName"] = first_name
        if last_name:
            payload["lastName"] = last_name

        data, error = self._client._request("POST", "/contacts", payload)
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Contact.from_dict(data))

    def get(self, contact_id: str) -> ApiResponse:
        """Get a contact by ID"""
        data, error = self._client._request("GET", f"/contacts/{contact_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Contact.from_dict(data))

    def list(self, audience_id: str) -> ApiResponse:
        """List contacts in an audience"""
        data, error = self._client._request(
            "GET", f"/contacts?audienceId={audience_id}"
        )
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=[Contact.from_dict(c) for c in data])

    def update(
        self,
        contact_id: str,
        *,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        unsubscribed: Optional[bool] = None,
    ) -> ApiResponse:
        """Update a contact"""
        payload: Dict[str, Any] = {}
        if first_name is not None:
            payload["firstName"] = first_name
        if last_name is not None:
            payload["lastName"] = last_name
        if unsubscribed is not None:
            payload["unsubscribed"] = unsubscribed

        data, error = self._client._request("PATCH", f"/contacts/{contact_id}", payload)
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=Contact.from_dict(data))

    def delete(self, contact_id: str) -> ApiResponse:
        """Delete a contact"""
        data, error = self._client._request("DELETE", f"/contacts/{contact_id}")
        if error:
            return ApiResponse(error=error)
        return ApiResponse(data=data)


class Unosend:
    """Unosend API Client"""

    def __init__(self, api_key: str, *, base_url: str = "https://api.unosend.com/v1"):
        if not api_key:
            raise ValueError("API key is required")

        self._api_key = api_key
        self._base_url = base_url
        self._client = httpx.Client(
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "unosend-python/1.0.0",
            },
            timeout=30.0,
        )

        # Initialize resource classes
        self.emails = Emails(self)
        self.domains = Domains(self)
        self.audiences = Audiences(self)
        self.contacts = Contacts(self)

    def _request(
        self,
        method: str,
        path: str,
        body: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Any, Optional[UnosendError]]:
        """Make an API request"""
        url = f"{self._base_url}{path}"

        try:
            if method == "GET":
                response = self._client.get(url)
            elif method == "POST":
                response = self._client.post(url, json=body)
            elif method == "PUT":
                response = self._client.put(url, json=body)
            elif method == "PATCH":
                response = self._client.patch(url, json=body)
            elif method == "DELETE":
                response = self._client.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")

            data = response.json()

            if not response.is_success:
                error = data.get("error", {})
                return None, UnosendError(
                    message=error.get("message", "Unknown error"),
                    code=error.get("code", response.status_code),
                    status_code=response.status_code,
                )

            return data.get("data", data), None

        except httpx.RequestError as e:
            return None, UnosendError(message=str(e), code=0)

    def close(self):
        """Close the HTTP client"""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
