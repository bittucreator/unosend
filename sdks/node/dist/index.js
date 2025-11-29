"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Unosend: () => Unosend,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var Emails = class {
  constructor(client) {
    this.client = client;
  }
  async send(options) {
    return this.client.request("POST", "/emails", {
      ...options,
      to: Array.isArray(options.to) ? options.to : [options.to],
      cc: options.cc ? Array.isArray(options.cc) ? options.cc : [options.cc] : void 0,
      bcc: options.bcc ? Array.isArray(options.bcc) ? options.bcc : [options.bcc] : void 0
    });
  }
  async get(id) {
    return this.client.request("GET", `/emails/${id}`);
  }
  async list(options) {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.offset) params.set("offset", options.offset.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.client.request("GET", `/emails${query}`);
  }
  async cancel(id) {
    return this.client.request("POST", `/emails/${id}/cancel`);
  }
};
var Domains = class {
  constructor(client) {
    this.client = client;
  }
  async create(name) {
    return this.client.request("POST", "/domains", { name });
  }
  async get(id) {
    return this.client.request("GET", `/domains/${id}`);
  }
  async list() {
    return this.client.request("GET", "/domains");
  }
  async verify(id) {
    return this.client.request("POST", `/domains/${id}/verify`);
  }
  async delete(id) {
    return this.client.request("DELETE", `/domains/${id}`);
  }
};
var Audiences = class {
  constructor(client) {
    this.client = client;
  }
  async create(name) {
    return this.client.request("POST", "/audiences", { name });
  }
  async get(id) {
    return this.client.request("GET", `/audiences/${id}`);
  }
  async list() {
    return this.client.request("GET", "/audiences");
  }
  async delete(id) {
    return this.client.request("DELETE", `/audiences/${id}`);
  }
};
var Contacts = class {
  constructor(client) {
    this.client = client;
  }
  async create(audienceId, contact) {
    return this.client.request("POST", "/contacts", { audienceId, ...contact });
  }
  async get(id) {
    return this.client.request("GET", `/contacts/${id}`);
  }
  async list(audienceId) {
    return this.client.request("GET", `/contacts?audienceId=${audienceId}`);
  }
  async update(id, data) {
    return this.client.request("PATCH", `/contacts/${id}`, data);
  }
  async delete(id) {
    return this.client.request("DELETE", `/contacts/${id}`);
  }
};
var Unosend = class {
  constructor(apiKey, options) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl || "https://api.unosend.com/v1";
    this.emails = new Emails(this);
    this.domains = new Domains(this);
    this.audiences = new Audiences(this);
    this.contacts = new Contacts(this);
  }
  async request(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "unosend-node/1.0.0"
        },
        body: body ? JSON.stringify(body) : void 0
      });
      const json = await response.json();
      if (!response.ok) {
        return {
          data: null,
          error: {
            message: json.error?.message || "Unknown error",
            code: json.error?.code || response.status,
            statusCode: response.status
          }
        };
      }
      return {
        data: json.data || json,
        error: null
      };
    } catch (err) {
      return {
        data: null,
        error: {
          message: err instanceof Error ? err.message : "Network error",
          code: 0
        }
      };
    }
  }
};
var index_default = Unosend;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Unosend
});
