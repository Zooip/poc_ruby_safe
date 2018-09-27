class ApplicationController < ActionController::Base

  rescue_from CustomErrors::ServiceExecutionAborted, with: :render_service_error

  def render_service_error(error)
    respond_to do |format|
      format.json { render json: {
        error: error.message
      }, status: error.status}
    end

  end

end
