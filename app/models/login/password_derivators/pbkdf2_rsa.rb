module Login
  module PasswordDerivators
    class Pbkdf2Rsa < BaseDerivator
  
      register_as "pbkdf2/rsa"
  
      field :salt, type: BSON::Binary
      field :iterations, type: Integer
      field :message_digest_algorithm, type:  Symbol
      field :hash_size, type:  Integer
      field :key_Size, type:  Integer
      field :prime_generator_algorithm, type: String
  
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
          hash_size:                 hash_size,
          key_Size:                  key_Size,
          prime_generator_algorithm: prime_generator_algorithm,
        }
      end
  
    end
  end
end  
