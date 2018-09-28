module Login
  module CredentialsRetrievers
    class Default

      def initialize
      end

      def retrieve(identifier)
        User.find_by('credentials.identifier'=>identifier)&.credentials
      end

    end
  end
end