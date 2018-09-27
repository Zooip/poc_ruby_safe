module CustomErrors
  class ServiceExecutionAborted < StandardError
    attr_accessor :status

    def initialize(attrs)
      @status=attrs.fetch(:status, :server_error)
      super(attrs[:message]||"ServiceError")
    end

  end
end