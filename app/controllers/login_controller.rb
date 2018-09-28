class LoginController < ApiController
  before_action :set_session, only: [:show, :update, :destroy]

  # POST login/identify
  # POST login/identify.json
  def identify
    challenge_generator=Login::ChallengeGeneratorService.new(identifier)

    render json: challenge_generator.render_hash, status: 200
  end

  # POST login/authentify
  # POST login/authentify.json
  def authentify
    challenge=Login::Challenge.new(challenge: challenge_value, identifier: identifier)
    credentials=Login::CredentialsRetrievers::Paranoid.new().retrieve(identifier)

    if credentials.public_key.verify(signature: signature, challenge: challenge)
      render json:{status: "success !"}, status: 200
    else
      render json:{status: "Wrong password"}, status: 401
    end
  end


  # DELETE /sessions/1
  # DELETE /sessions/1.json
  def destroy
    @session.destroy
  end

  private

  def identifier
    params.require(:identifier)
  end

  def challenge_value
    params.require(:challenge)
  end

  def signature
    es=params.require(:encodedSignature)
    Base64.decode64(es)
  end

end
