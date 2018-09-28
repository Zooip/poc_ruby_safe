module Login
  module PasswordDerivators
    class Pbkdf2Ed25519 < BaseDerivator

      register_as "pbkdf2/ed25519"

      field :salt, type: BSON::Binary
      field :iterations, type: Integer
      field :message_digest_algorithm, type:  Symbol

      def encoded_salt
        salt&&Base64.encode64(salt.data).delete("\n")
      end

      def encoded_salt=(v)
        self.salt=BSON::Binary.new(Base64.decode64(v))
      end

      def params_to_h
        {
          encoded_salt:              encoded_salt,
          iterations:                iterations,
          message_digest_algorithm:  message_digest_algorithm,
        }
      end

    end
  end
end
