module PasswordDerivators
  class BaseDerivator
    include Mongoid::Document
    embedded_in :credentials_entry

    mattr_reader :algorithm

    def self.register_as(key)
      class_variable_set("@@algorithm", key)
      ::PasswordDerivators::Referential.add(key,self)
    end

    def to_h
      {
        algorithm: algorithm,
        params: params_to_h
      }
    end

  end
end