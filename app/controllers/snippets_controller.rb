require 'builder'

class SnippetsController < ApplicationController
    helper_method :sort_column, :sort_direction

    def saveSnippetViaAjax
        # Define params.
        lang = params[:lang]
        trigger = params[:trigger]
        snippet = params[:snippet]
        puts "lang=" + lang
        puts "trigger=" + trigger
        puts "snippet=" + snippet

        # Find the snippet object.
        s = Snippet.find_by trigger: trigger
        case lang
        when "ruby2"
            s.ruby2 = snippet
        when "bash4"
            s.bash4 = snippet
        when "vim"
            s.vim = snippet
        when "java"
            s.java = snippet
        when "vbs"
            s.vbs = snippet
        when "python3"
            s.python3 = snippet
        when "js"
            s.js = snippet
        when "winshell"
            s.winshell = snippet
        when "powershell"
            s.powershell = snippet
        when "groovy"
            s.groovy = snippet
        when "c"
            s.c = snippet
        when "cpp"
            s.cpp = snippet
        when "scala"
            s.scala = snippet
        when "erlang"
            s.erlang = snippet
        when "clojure"
            s.clojure = snippet
        when "rails4"
            s.rails4 = snippet
        end
        puts s.save

        render nothing: true
    end

    def index #{{{
        #@snippets = sort(Snippet.all)
        @snippets = Snippet.order(sort_column + " " + sort_direction)
    end #}}}

    def new #{{{
        @snippet = Snippet.new
    end #}}}

    def create #{{{
        # Create new Snippet object.
        @snippet = Snippet.new(post_params)

        # Save Snippet object to db.
        if @snippet.save
            redirect_to snippets_path
        else
            render 'new'
        end
    end #}}}

    def show #{{{
        @snippet = Snippet.find(params[:id])
    end #}}}

    def update #{{{
        @snippet = Snippet.find(params[:id])

        # Attempt to update the snippet in the db.
        if @snippet.update(post_params)
            redirect_to edit_snippet_path
        end
    end #}}}

    def edit #{{{
        @snippet = Snippet.find(params[:id])
    end #}}}

    def destroy #{{{
        @snippet = Snippet.find(params[:id])
        @snippet.destroy
        redirect_to snippets_path
    end #}}}

    def export #{{{
        snippets = sort(Snippet.all)
        b = Builder::XmlMarkup.new(:indent=>4)
        @xml = ""
        @errors = []
        if params[:ide] == nil
            @errors << "No IDE selected.  Use 'ide' URL param."
        elsif params[:ide] == "idea"
            b.instruct! :xml, :version=>"1.0", :encoding=>"UTF-8"
            b.templateSet(:group=>"plad_idea") {
                snippets.each { |s|
                    if s.java != nil and s.java != ""
                        # Get map of all variables and their default values.
                        variables = {}
                        regex = /\${(\d):?(.*?)}/
                        s.java.scan(regex) { |var,default|
                            variables[var] = default
                        }

                        # Replace each variable with IntelliJ friendly syntax.
                        newValue = s.java
                        variables.each { |key,val|
                            if val != nil and val != "" and val.scan(/\W/).size == 0
                                replacement = val
                            else
                                replacement = key
                            end
                            newValue.gsub!(/\$#{key}/, "$" + replacement + "$") #Replaces like $key.
                            newValue.gsub!(/\$\{#{key}.*?\}/, "$" + replacement + "$") #Replaces like ${key.*?}.
                        }

                        b.template(:name=>s.trigger, :value=>newValue, :description=>s.desc, :toReformat=>"true", :toShortenFQNames=>"true") {
                            # Variables.
                            variables.sort_by { |k,v| k } # Key is an integer denoting sequence.
                            variables.each { |key,val|
                                if val != nil and val != "" and val.scan(/\W/).size == 0
                                    b.variable(:name=>val, :expression=>"", :defaultValue=>val, :alwaysStopAt=>"true")
                                else
                                    b.variable(:name=>key, :expression=>"", :defaultValue=>val, :alwaysStopAt=>"true")
                                end
                            }

                            # Other template settings.
                            b.context {
                                b.option(:name=>"JAVA_CODE", :value=>"true")
                                b.option(:name=>"JAVA_STATEMENT", :value=>"true")
                                b.option(:name=>"JAVA_EXPRESSION", :value=>"false")
                                b.option(:name=>"JAVA_DECLARATION", :value=>"false")
                                b.option(:name=>"JAVA_COMMENT", :value=>"false")
                                b.option(:name=>"JAVA_STRING", :value=>"false")
                                b.option(:name=>"COMPLETION", :value=>"false")
                            }
                        }
                    end
                }
            }
            @xml += b.to_s.gsub!(/\&lt;/, '<').gsub!(/&gt;/, '>')
        elsif params[:ide] == "nb"
            b.instruct! :xml, :version=>"1.0", :encoding=>"UTF-8"
            b.declare! :DOCTYPE, :codeTemplates, :PUBLIC, "-//NetBeans//DTD Editor Code Templates settings 1.0//EN", "http://www.netbeans.org/dtds/EditorCodeTemplates-1_0.dtd"
            b.codeTemplates() {
                snippets.each { |s|
                    if s.java != nil and s.java != ""
                        # Get map of all variables and their default values.
                        variables = {}
                        regex = /\${(\d):?(.*?)}/
                        s.java.scan(regex) { |var,default|
                            variables[var] = default
                        }

                        # Replace each variable with IntelliJ friendly syntax.
                        newValue = s.java
                        variables.each { |key,val|
                            if val != nil and val != "" and val.scan(/\W/).size == 0
                                replacement = val
                            else
                                replacement = key
                            end
                            newValue.gsub!(/\$#{key}/, "$" + replacement + "$") #Replaces like $key.
                            newValue.gsub!(/\$\{#{key}.*?\}/, "$" + replacement + "$") #Replaces like ${key.*?}.
                        }

                        b.codeTemplate(:abbreviation=>s.trigger, :'xml:space'=>"preserve") {
                            b.code '<![CDATA[' + newValue + ']]>'
                            b.descriptions s.desc
                        }
                    end
                }
            }
            @xml += b.to_s.gsub!(/\&lt;/, '<').gsub!(/&gt;/, '>')
        elsif params[:ide] == "vim"
            output = ""
            if !params[:langs] or (params[:langs] and params[:langs].include? 'java')
                output += "==Java 7\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.java) if s.java != nil and s.java != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'ruby2')
                output += "\n\n==Ruby 2\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.ruby2) if s.ruby2 != nil and s.ruby2 != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'python3')
                output += "\n\n==Python 3\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.python3) if s.python3 != nil and s.python3 != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'bash4')
                output += "\n\n==BASH 4\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.bash4) if s.bash4 != nil and s.bash4 != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'vim')
                output += "\n\n==Vim\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.vim) if s.vim != nil and s.vim != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'scala')
                output += "\n\n==Scala\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.scala) if s.scala != nil and s.scala != "" }
            end
            if !params[:langs] or (params[:langs] and params[:langs].include? 'js')
                output += "\n\n==Js\n"
                snippets.each { |s| output += toStringSnippetForVim(s.trigger, s.js) if s.js != nil and s.js != "" }
            end
            @xml = output
        else
            @errors << "Unknown IDE parameter: " + params[:ide]
        end
    end #}}}

    def toStringSnippetForVim(trigger, code)
        "snippet " + trigger + "\n\t" + code.gsub(/\n/, "\n\t") + "\n"
    end

    private
        # Define required and permitted HTML POST parameters.
        def post_params #{{{
            params.require(:snippet).permit(:trigger, :links, :pre, :category, :desc, :ruby2, :bash4, :vim, :java, :vbs, :python3, :js, :winshell, :powershell, :groovy, :c, :cpp, :scala, :erlang, :clojure, :rails4)
        end #}}}

        def sort(snippets) #{{{
            snippets.sort_by do |s|
                [s.category, s.trigger]
            end
        end #}}}

        def sort_column
            Snippet.column_names.include?(params[:sort]) ? params[:sort] : "trigger"
        end

        def sort_direction
            %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
        end

end
