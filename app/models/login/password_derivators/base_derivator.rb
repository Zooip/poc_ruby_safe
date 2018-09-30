module Login
  module PasswordDerivators
    class BaseDerivator
      include Mongoid::Document
      embedded_in :credentials_entry

      def algorithm
        self.class.algorithm
      end

      def self.algorithm
        @algorithm
      end

      def self.register_as(key)
        @algorithm = key
        PasswordDerivators::Referential.add(key, self.name)
      end

      def to_h
        {
          algorithm: algorithm,
          params:    params_to_h
        }
      end
    end
  end
end
