module Login
  module PasswordDerivators
    module Referential
      extend self
      @ref ||= {}
  
      attr_reader :ref
  
      def add(key, klass_name)
        Rails.logger.error "Register #{key} to #{klass_name}"
        @ref[sanitize_key(key)] = klass_name
      end
  
      def get(key)
        @ref[sanitize_key(key)].constantize
      end
  
      private
  
      def sanitize_key(key)
        key.to_s.downcase.gsub(/[^0-9a-z]/i,'_').to_sym
      end
    end
  end
end  
