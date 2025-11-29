# frozen_string_literal: true

require_relative "lib/unosend/version"

Gem::Specification.new do |spec|
  spec.name = "unosend"
  spec.version = Unosend::VERSION
  spec.authors = ["Unosend"]
  spec.email = ["support@unosend.com"]

  spec.summary = "Official Ruby SDK for Unosend - Email API Service"
  spec.description = "Send emails with Unosend's powerful API. Features include transactional emails, audience management, and domain verification."
  spec.homepage = "https://unosend.com"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 2.7.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/unosend/unosend-ruby"
  spec.metadata["changelog_uri"] = "https://github.com/unosend/unosend-ruby/blob/main/CHANGELOG.md"

  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|circleci)|appveyor)})
    end
  end

  spec.require_paths = ["lib"]
end
