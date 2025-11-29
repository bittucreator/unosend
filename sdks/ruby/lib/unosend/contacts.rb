# frozen_string_literal: true

module Unosend
  class Contacts
    def initialize(client)
      @client = client
    end

    # Create a new contact
    #
    # @param audience_id [String] Audience ID
    # @param email [String] Contact email
    # @param first_name [String] First name (optional)
    # @param last_name [String] Last name (optional)
    # @return [Hash] The created contact
    def create(audience_id:, email:, first_name: nil, last_name: nil)
      payload = {
        audienceId: audience_id,
        email: email
      }

      payload[:firstName] = first_name if first_name
      payload[:lastName] = last_name if last_name

      @client.request(:post, "/contacts", payload)
    end

    # Get a contact by ID
    #
    # @param id [String] Contact ID
    # @return [Hash] The contact
    def get(id)
      @client.request(:get, "/contacts/#{id}")
    end

    # List contacts in an audience
    #
    # @param audience_id [String] Audience ID
    # @return [Array<Hash>] List of contacts
    def list(audience_id)
      @client.request(:get, "/contacts?audienceId=#{audience_id}")
    end

    # Update a contact
    #
    # @param id [String] Contact ID
    # @param first_name [String] First name (optional)
    # @param last_name [String] Last name (optional)
    # @param unsubscribed [Boolean] Unsubscribed status (optional)
    # @return [Hash] The updated contact
    def update(id, first_name: nil, last_name: nil, unsubscribed: nil)
      payload = {}
      payload[:firstName] = first_name unless first_name.nil?
      payload[:lastName] = last_name unless last_name.nil?
      payload[:unsubscribed] = unsubscribed unless unsubscribed.nil?

      @client.request(:patch, "/contacts/#{id}", payload)
    end

    # Delete a contact
    #
    # @param id [String] Contact ID
    # @return [Hash] Deletion confirmation
    def delete(id)
      @client.request(:delete, "/contacts/#{id}")
    end
  end
end
