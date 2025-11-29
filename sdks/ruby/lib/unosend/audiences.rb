# frozen_string_literal: true

module Unosend
  class Audiences
    def initialize(client)
      @client = client
    end

    # Create a new audience
    #
    # @param name [String] Audience name
    # @return [Hash] The created audience
    def create(name)
      @client.request(:post, "/audiences", { name: name })
    end

    # Get an audience by ID
    #
    # @param id [String] Audience ID
    # @return [Hash] The audience
    def get(id)
      @client.request(:get, "/audiences/#{id}")
    end

    # List all audiences
    #
    # @return [Array<Hash>] List of audiences
    def list
      @client.request(:get, "/audiences")
    end

    # Delete an audience
    #
    # @param id [String] Audience ID
    # @return [Hash] Deletion confirmation
    def delete(id)
      @client.request(:delete, "/audiences/#{id}")
    end
  end
end
