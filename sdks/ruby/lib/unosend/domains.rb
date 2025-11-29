# frozen_string_literal: true

module Unosend
  class Domains
    def initialize(client)
      @client = client
    end

    # Create a new domain
    #
    # @param name [String] Domain name
    # @return [Hash] The created domain
    def create(name)
      @client.request(:post, "/domains", { name: name })
    end

    # Get a domain by ID
    #
    # @param id [String] Domain ID
    # @return [Hash] The domain
    def get(id)
      @client.request(:get, "/domains/#{id}")
    end

    # List all domains
    #
    # @return [Array<Hash>] List of domains
    def list
      @client.request(:get, "/domains")
    end

    # Verify a domain
    #
    # @param id [String] Domain ID
    # @return [Hash] The verified domain
    def verify(id)
      @client.request(:post, "/domains/#{id}/verify")
    end

    # Delete a domain
    #
    # @param id [String] Domain ID
    # @return [Hash] Deletion confirmation
    def delete(id)
      @client.request(:delete, "/domains/#{id}")
    end
  end
end
