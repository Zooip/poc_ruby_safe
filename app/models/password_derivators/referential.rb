module PasswordDerivators
  module Referential
    extend self
    @ref ||= {}

    attr_reader :ref

    def add(key, klass)
      @ref[sanitize_key(key)] = klass
    end

    def get(key)
      @ref[sanitize_key(key)]
    end

    private

    def sanitize_key(key)
      key.to_s.downcase.gsub(/[^0-9a-z]/i,'_').to_sym
    end
  end
end