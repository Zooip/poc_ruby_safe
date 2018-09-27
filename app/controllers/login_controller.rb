class LoginController < ApiController
  before_action :set_session, only: [:show, :update, :destroy]

  def identify
    identifier=params.require(:identifier)
    challenge_generator=Login::ChallengeGeneratorService.new(identifier)

    render json: challenge_generator.render_hash, status: 200
  end

  # POST /sessions
  # POST /sessions.json
  def create

  end


  # DELETE /sessions/1
  # DELETE /sessions/1.json
  def destroy
    @session.destroy
  end

  private

  def create_challenge_params
    params.permit(:identifier)
  end

end
