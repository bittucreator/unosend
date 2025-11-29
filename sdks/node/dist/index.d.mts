interface UnosendConfig {
    apiKey: string;
    baseUrl?: string;
}
interface SendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    headers?: Record<string, string>;
    attachments?: Attachment[];
    tags?: Tag[];
}
interface Attachment {
    filename: string;
    content: string | Buffer;
    contentType?: string;
}
interface Tag {
    name: string;
    value: string;
}
interface Email {
    id: string;
    from: string;
    to: string[];
    subject: string;
    status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed';
    createdAt: string;
}
interface EmailResponse {
    data: Email | null;
    error: UnosendError | null;
}
interface EmailListResponse {
    data: Email[] | null;
    error: UnosendError | null;
}
interface Domain {
    id: string;
    name: string;
    status: 'pending' | 'verified' | 'failed';
    records: DnsRecord[];
    createdAt: string;
}
interface DnsRecord {
    type: string;
    name: string;
    value: string;
    ttl: number;
}
interface DomainResponse {
    data: Domain | null;
    error: UnosendError | null;
}
interface DomainListResponse {
    data: Domain[] | null;
    error: UnosendError | null;
}
interface Audience {
    id: string;
    name: string;
    contactCount: number;
    createdAt: string;
}
interface Contact {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    unsubscribed: boolean;
    createdAt: string;
}
interface AudienceResponse {
    data: Audience | null;
    error: UnosendError | null;
}
interface AudienceListResponse {
    data: Audience[] | null;
    error: UnosendError | null;
}
interface ContactResponse {
    data: Contact | null;
    error: UnosendError | null;
}
interface ContactListResponse {
    data: Contact[] | null;
    error: UnosendError | null;
}
interface UnosendError {
    message: string;
    code: number;
    statusCode?: number;
}
interface ApiKeyInfo {
    id: string;
    name: string;
    prefix: string;
    lastUsedAt: string | null;
    createdAt: string;
}
declare class Emails {
    private client;
    constructor(client: Unosend);
    send(options: SendEmailOptions): Promise<EmailResponse>;
    get(id: string): Promise<EmailResponse>;
    list(options?: {
        limit?: number;
        offset?: number;
    }): Promise<EmailListResponse>;
    cancel(id: string): Promise<EmailResponse>;
}
declare class Domains {
    private client;
    constructor(client: Unosend);
    create(name: string): Promise<DomainResponse>;
    get(id: string): Promise<DomainResponse>;
    list(): Promise<DomainListResponse>;
    verify(id: string): Promise<DomainResponse>;
    delete(id: string): Promise<{
        data: {
            deleted: boolean;
        } | null;
        error: UnosendError | null;
    }>;
}
declare class Audiences {
    private client;
    constructor(client: Unosend);
    create(name: string): Promise<AudienceResponse>;
    get(id: string): Promise<AudienceResponse>;
    list(): Promise<AudienceListResponse>;
    delete(id: string): Promise<{
        data: {
            deleted: boolean;
        } | null;
        error: UnosendError | null;
    }>;
}
declare class Contacts {
    private client;
    constructor(client: Unosend);
    create(audienceId: string, contact: {
        email: string;
        firstName?: string;
        lastName?: string;
    }): Promise<ContactResponse>;
    get(id: string): Promise<ContactResponse>;
    list(audienceId: string): Promise<ContactListResponse>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        unsubscribed?: boolean;
    }): Promise<ContactResponse>;
    delete(id: string): Promise<{
        data: {
            deleted: boolean;
        } | null;
        error: UnosendError | null;
    }>;
}
declare class Unosend {
    private apiKey;
    private baseUrl;
    emails: Emails;
    domains: Domains;
    audiences: Audiences;
    contacts: Contacts;
    constructor(apiKey: string, options?: {
        baseUrl?: string;
    });
    request<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: Record<string, unknown>): Promise<{
        data: T | null;
        error: UnosendError | null;
    }>;
}

export { type ApiKeyInfo, type Attachment, type Audience, type AudienceListResponse, type AudienceResponse, type Contact, type ContactListResponse, type ContactResponse, type DnsRecord, type Domain, type DomainListResponse, type DomainResponse, type Email, type EmailListResponse, type EmailResponse, type SendEmailOptions, type Tag, Unosend, type UnosendConfig, type UnosendError, Unosend as default };
