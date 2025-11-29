# frozen_string_literal: true

require_relative "unosend/version"
require_relative "unosend/client"
require_relative "unosend/emails"
require_relative "unosend/domains"
require_relative "unosend/audiences"
require_relative "unosend/contacts"

module Unosend
  class Error < StandardError
    attr_reader :code, :status_code

    def initialize(message, code: nil, status_code: nil)
      @code = code
      @status_code = status_code
      super(message)
    end
  end
end
