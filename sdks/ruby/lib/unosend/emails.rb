# frozen_string_literal: true

module Unosend
  class Emails
    def initialize(client)
      @client = client
    end

    # Send an email
    #
    # @param from [String] Sender email address
    # @param to [String, Array<String>] Recipient email address(es)
    # @param subject [String] Email subject
    # @param html [String] HTML content (optional)
    # @param text [String] Plain text content (optional)
    # @param reply_to [String] Reply-to address (optional)
    # @param cc [String, Array<String>] CC recipients (optional)
    # @param bcc [String, Array<String>] BCC recipients (optional)
    # @param headers [Hash] Custom headers (optional)
    # @param tags [Array<Hash>] Tags (optional)
    # @return [Hash] The sent email
    def send(from:, to:, subject:, html: nil, text: nil, reply_to: nil, cc: nil, bcc: nil, headers: nil, tags: nil)
      payload = {
        from: from,
        to: Array(to),
        subject: subject
      }

      payload[:html] = html if html
      payload[:text] = text if text
      payload[:reply_to] = reply_to if reply_to
      payload[:cc] = Array(cc) if cc
      payload[:bcc] = Array(bcc) if bcc
      payload[:headers] = headers if headers
      payload[:tags] = tags if tags

      @client.request(:post, "/emails", payload)
    end

    # Get an email by ID
    #
    # @param id [String] Email ID
    # @return [Hash] The email
    def get(id)
      @client.request(:get, "/emails/#{id}")
    end

    # List emails
    #
    # @param limit [Integer] Maximum number of results (optional)
    # @param offset [Integer] Offset for pagination (optional)
    # @return [Array<Hash>] List of emails
    def list(limit: nil, offset: nil)
      path = "/emails"
      params = []
      params << "limit=#{limit}" if limit
      params << "offset=#{offset}" if offset
      path += "?#{params.join("&")}" unless params.empty?

      @client.request(:get, path)
    end
  end
end
