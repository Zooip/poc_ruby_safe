Rails.application.routes.draw do
  get 'home/home'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  #
  root 'home#home'

  match 'login/identify', to: 'login#identify', via: [:post]
  match 'login/authentify', to: 'login#authentify', via: [:post]
end
