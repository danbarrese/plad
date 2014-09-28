Plad::Application.routes.draw do
  get "export/index"
    resources :snippets
    root to: "welcome#index"
    #match '/test', to: "snippets#test", via: :get
    match '/export', to: "snippets#export", via: :get
    match '/saveSnippetViaAjax', to: "snippets#saveSnippetViaAjax", via: :get
end
