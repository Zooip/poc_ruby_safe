module Login
  module CredentialsRetrievers
    class Paranoid

      DEFAULT_PERSISTENCE_DURATION = 86000

      def initialize(options = {})
        options               = options.symbolize_keys
        @persistent           = options.fetch(:persistent, false)
        @persistence_duration = options.fetch(:persistence_duration, DEFAULT_PERSISTENCE_DURATION)
      end

      def retrieve(identifier)
        default_retriever.retrieve(identifier)||build_random_credentials(identifier: identifier)
      end

      def default_retriever
        Default.new
      end

      def build_random_credentials(params = {})
        CredentialsEntry.new(
          identifier:         params[:identifier],
          password_derivator: PasswordDerivators::Pbkdf2Rsa.new(
            salt:                      BSON::Binary.new(SecureRandom.random_bytes(48)),
            iterations:                1000,
            message_digest_algorithm:  :sha1,
            hash_size:                 2048,
            key_Size:                  2048,
            prime_generator_algorithm: 'PRIMEINC'
          )
        )
      end

    end
  end
end