var matheditor;
window.matheditor = matheditor;

$(document).ready(function () {
    if (!matheditor) {
        matheditor = new MathEditor();
    }
});

function MathEditor() {
    this.latexSource = document.getElementById('latex-source');
    this.latexMath = document.getElementById('editable-math');
    this.FormulasPanelsLoaded = [];
    this.initialize();
}

MathEditor.prototype = {
    initialize: function () {
        this.initializeLaTexSource();
        this.initializeMath();
        this.initializeAccordions();
        this.latexSource.setSelectionRange(this.latexSource.value.length, this.latexSource.value.length);
        this.insert("\\Delta =\\sum_{i=1}^N w_i (x_i - \\bar{x})^2");
    },
    initializeAccordions: function () {
        var matheditor = this;
        $("#aaFormulas").accordion({
            onSelect: function (title) {
                var fPanel = $("#aaFormulas").accordion("getSelected");
                if (fPanel) {
                    var fPanelID = $(fPanel).attr("id");
                    if (matheditor.FormulasPanelsLoaded.indexOf(fPanelID) == -1)
                    {
                        matheditor.FormulasPanelsLoaded[matheditor.FormulasPanelsLoaded.length] = fPanelID;
                        $(fPanel).load("/assets/formulas/" + fPanelID + ".HTML", function () {
                            matheditor.initializeFormulaSymbols(fPanelID);
                        });
                    }
                }
                
            }
        });
        var p = $("#aaFormulas").accordion('getSelected');
        if (p) {
            p.panel('collapse', false);
        }
    },
    initializeFormulaSymbols: function (PanelID) {
        var matheditor = this;

        function getSymbol(obj) {
            if (typeof ($(obj).attr("lbegin")) != "undefined" && typeof ($(obj).attr("lend")) != "undefined") {
                return $(obj).attr("lbegin") + $(obj).attr("lend");
            }
            else if (typeof ($(obj).attr("latex")) != "undefined") {
                return $(obj).attr("latex");
            }
            else {
                return matheditor.getLocalText("NO_LATEX");
            }
        };

        $("#" + PanelID + " a.s").addClass("easyui-tooltip").attr("title", function (index, attr) {
            return getSymbol(this);
        }).mouseover(function (event) {
            $("#divInformation").html(getSymbol(this));
        }).mouseout(function (event) {
            $("#divInformation").html("&nbsp;");
        }).click(function (event) {
            event.preventDefault();
            if (typeof ($(this).attr("lbegin")) != "undefined" && typeof ($(this).attr("lend")) != "undefined") {
                matheditor.tag($(this).attr("lbegin"), $(this).attr("lend"));
            }
            else if (typeof ($(this).attr("latex")) != "undefined") {
                matheditor.insert($(this).attr("latex"));
            }
            else {
                //$.messager.show({
                //    title: "<span class='rtl-title-withicon'>" + matheditor.getLocalText("INFORMATION") + "</span>",
                //    msg: matheditor.getLocalText("NO_LATEX")
                //});
            }
        });
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, PanelID]);
    },
    initializeMath: function () {
        var matheditor = this;
        $('#editable-math').bind('keydown keypress', function () {
            matheditor.EditableMathChange();
        }).keydown().focus();
    },
    initializeLaTexSource: function () {
        var matheditor = this;
        $('#latex-source').bind('keydown keypress paste', function () {
            matheditor.SourceLaTexChange();
        });
    },
    printTree: function (html) {
        html = html.match(/<[a-z]+|<\/[a-z]+>|./ig);
        if (!html) return '';
        var indent = '\n', tree = [];
        for (var i = 0; i < html.length; i += 1) {
            var token = html[i];
            if (token.charAt(0) === '<') {
                if (token.charAt(1) === '/') { //dedent on close tag
                    indent = indent.slice(0, -2);
                    if (html[i + 1] && html[i + 1].slice(0, 2) === '</') //but maintain indent for close tags that come after other close tags
                        token += indent.slice(0, -2);
                }
                else { //indent on open tag
                    tree.push(indent);
                    indent += '  ';
                }

                token = token.toLowerCase();
            }

            tree.push(token);
        }
        return tree.join('').slice(1);
    },
    insert: function (b) {
        $('#editable-math').mathquill('write', b);
        this.EditableMathChange();
    },
    setFocus: function () {
        //if (!this.runNotCodeMirror && this.codeMirrorEditor) this.codeMirrorEditor.focus();
        $("#latex-source").focus();
    },
    tag: function (b, a) {
        b = b || null;
        a = a || b;
        if (!b || !a) {
            return
        }
        this.insert(b);
        this.setFocus();
    },
    EditableMathChange: function () {
        setTimeout(function () {
            var latex = $('#editable-math').mathquill('latex');                
            $('#latex-source').val(latex);
        });
    },
    SourceLaTexChange: function () {
        var oldtext = $('#latex-source').val();
        setTimeout(function () {
            var newtext = $('#latex-source').val();
            if (newtext !== oldtext) {
                $('#editable-math').mathquill('latex', newtext);
            }
        });
    },
    UpdateVisualMath: function () {
        setTimeout(function () {
            $('#editable-math').mathquill('latex', $('#latex-source').val());
        });
    }
};