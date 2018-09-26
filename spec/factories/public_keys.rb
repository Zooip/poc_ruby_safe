FactoryBot.define do
  factory :public_key do
    pem { OpenSSL::PKey::RSA.new(2048).public_key.to_pem }
  end
end
