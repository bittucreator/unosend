# frozen_string_literal: true

require "net/http"
require "json"
require "uri"

module Unosend
  class Client
    DEFAULT_BASE_URL = "https://api.unosend.com/v1"
    USER_AGENT = "unosend-ruby/1.0.0"

    attr_reader :emails, :domains, :audiences, :contacts

    def initialize(api_key, base_url: DEFAULT_BASE_URL)
      raise ArgumentError, "API key is required" if api_key.nil? || api_key.empty?

      @api_key = api_key
      @base_url = base_url

      @emails = Emails.new(self)
      @domains = Domains.new(self)
      @audiences = Audiences.new(self)
      @contacts = Contacts.new(self)
    end

    def request(method, path, body = nil)
      uri = URI.parse("#{@base_url}#{path}")

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.read_timeout = 30
      http.open_timeout = 10

      request = build_request(method, uri, body)

      response = http.request(request)
      parse_response(response)
    end

    private

    def build_request(method, uri, body)
      request = case method.to_s.upcase
                when "GET"
                  Net::HTTP::Get.new(uri)
                when "POST"
                  Net::HTTP::Post.new(uri)
                when "PUT"
                  Net::HTTP::Put.new(uri)
                when "PATCH"
                  Net::HTTP::Patch.new(uri)
                when "DELETE"
                  Net::HTTP::Delete.new(uri)
                else
                  raise ArgumentError, "Unsupported HTTP method: #{method}"
                end

      request["Authorization"] = "Bearer #{@api_key}"
      request["Content-Type"] = "application/json"
      request["User-Agent"] = USER_AGENT

      request.body = body.to_json if body

      request
    end

    def parse_response(response)
      body = response.body ? JSON.parse(response.body) : {}

      unless response.is_a?(Net::HTTPSuccess)
        error = body["error"] || {}
        raise Error.new(
          error["message"] || "Unknown error",
          code: error["code"] || response.code.to_i,
          status_code: response.code.to_i
        )
      end

      body["data"] || body
    rescue JSON::ParserError
      raise Error.new("Invalid JSON response", code: 0)
    end
  end
end
