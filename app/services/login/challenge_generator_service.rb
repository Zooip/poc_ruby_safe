module Login
  class ChallengeGeneratorService

    DEFAULT_CRED_RETRIEVER_KLASS=CredentialsRetrievers::Default

    attr_reader :identifier
    attr_reader :credential_retriever

    def initialize(identifier, options={})
      @identifier=identifier
      @credential_retriever=options.fetch(:credential_retriever, DEFAULT_CRED_RETRIEVER_KLASS.new)
    end

    def credentials
      unless(@credentials)
        @credentials=credential_retriever.retrieve(identifier)
        raise CustomErrors::ServiceExecutionAborted.new(
          status: :not_found,
          message:"Identifier not found"
        ) unless @credentials
      end
      @credentials
    end

    def auth_challenge
      AuthChallenge.generate_for(identifier)
    end

    def render_hash
      {
        password_derivator: credentials.password_derivator.to_h,
        challenge: auth_challenge.to_h
      }.deep_transform_keys { |key| key.to_s.camelize(:lower) }
    end


  end
end

