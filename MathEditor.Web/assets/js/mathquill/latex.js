// Parser MathCommand
var latexMathParser = (function () {
    function commandToBlock(cmd) {
        var block = MathBlock();
        cmd.adopt(block, 0, 0);
        return block;
    }
    function joinBlocks(blocks) {
        var firstBlock = blocks[0] || MathBlock();

        for (var i = 1; i < blocks.length; i += 1) {
            blocks[i].children().adopt(firstBlock, firstBlock.ends[R], 0);
        }

        return firstBlock;
    }

    var string = Parser.string;
    var regex = Parser.regex;
    var letter = Parser.letter;
    var any = Parser.any;
    var optWhitespace = Parser.optWhitespace;
    var succeed = Parser.succeed;
    var fail = Parser.fail;

    // Parsers yielding MathCommands
    var variable = letter.map(Variable);
    var symbol = regex(/^[^${}\\_^]/).map(VanillaSymbol);

    var controlSequence =
      regex(/^[^\\a-eg-zA-Z]/) // hotfix #164; match MathBlock::write
      .or(string('\\').then(
        regex(/^[a-z]+/i)
        .or(regex(/^\s+/).result(' '))
        .or(any)
      )).then(function (ctrlSeq) {
          var cmdKlass = LatexCmds[ctrlSeq];

          if (cmdKlass) {
              return cmdKlass(ctrlSeq).parser();
          }
          else {
              return fail('unknown command: \\' + ctrlSeq);
          }
      })
    ;

    var LeftRightCommand =
      regex(/^\\left/)
      .then(regex(/^(.*?)\\right/))
      .then(function (a) {
          // Strip out the trailing command (\end{matrix})
          //var content = a.replace(/\\end{matrix}/, '');

          //Determine if wee need to close or put a point
          
          // Retrieve the matrix command
          var cmd = LatexCmds.matrix();

          //// Parse the individual blocks within the matrix
          //// Refer to http://en.wikibooks.org/wiki/LaTeX/Mathematics to learn more about the LaTeX
          //// matrix notation.
          //// Basically rows are delimited by double backslashes and columns by ampersands
          //var blocks = [];
          //var rows = content.split('\\\\');
          //for (var i = 0; i < rows.length; i++) {
          //    // We have a row, now split it into its respective columns
          //    var columns = rows[i].split('&');
          //    for (var a = 0; a < columns.length; a++) {
          //        // Parse the individual block, this block may contain other more complicated commands
          //        // like a square root, we delegate the parsing of this to the Parser object. It returns
          //        // a MathElement block object which is the object representation of the formula.
          //        var block = latexMathParser.parse(columns[a]);
          //        blocks.push(block);
          //    }
          //}

          //// Tell our Latex.matrix command how big our matrix is, recall that MatrixSize is simply an
          //// alias for LatexCmds.matrix.setSize
          //MatrixSize(rows.length, columns.length);

          //// Attach the child blocks (each element of the matrix) to the parent matrix object
          //cmd.blocks = blocks;
          //for (var i = 0; i < blocks.length; i += 1) {
          //    blocks[i].adopt(cmd, cmd.ends[R], 0);
          //}
          //// The block elements attached to a command are each rendered and then they replace the
          //// '&0', '&1', '&2', '&3'... placeholders that are found within the command's htmlTemplate

          //// Return the Latex.matrix() object to the main parser so that it knows to render this
          //// particular portion of latex in this fashion
          return Parser.succeed(cmd);
      });


    var matrixCommand =
      regex(/^\\begin{matrix}/)
      .then(regex(/^(.*?)\\end{matrix}/))
      .then(function (a) {
          // Strip out the trailing command (\end{matrix})
          var content = a.replace(/\\end{matrix}/, '');

          //\begin{matrix}1&3&\begin{matrix}3\\3\\3\end{matrix}\end{matrix}33
          var blocks = [];
          var regex = /\\begin{matrix}(.*?)\\end{matrix}/g;
          var match = regex.exec(a);
          if (match) {
              var block = latexMathParser.parse(match[0]);
              blocks.push(block);
          }

          // Retrieve the matrix command
          var cmd = LatexCmds.matrix();

          // Parse the individual blocks within the matrix
          // Refer to http://en.wikibooks.org/wiki/LaTeX/Mathematics to learn more about the LaTeX
          // matrix notation.
          // Basically rows are delimited by double backslashes and columns by ampersands

          var rows;
          if (match) {
          }
          else {
              rows = content.split('\\\\');
          }
          for (var i = 0; i < rows.length; i++) {
              // We have a row, now split it into its respective columns
              var columns = rows[i].split('&');
              for (var a = 0; a < columns.length; a++) {
                  // Parse the individual block, this block may contain other more complicated commands
                  // like a square root, we delegate the parsing of this to the Parser object. It returns
                  // a MathElement block object which is the object representation of the formula.
                  var block = latexMathParser.parse(columns[a]);
                  blocks.push(block);
              }
          }

          // Tell our Latex.matrix command how big our matrix is, recall that MatrixSize is simply an
          // alias for LatexCmds.matrix.setSize
          MatrixSize(rows.length, columns.length);

          // Attach the child blocks (each element of the matrix) to the parent matrix object
          cmd.blocks = blocks;
          for (var i = 0; i < blocks.length; i += 1) {
              blocks[i].adopt(cmd, cmd.ends[R], 0);
          }
          // The block elements attached to a command are each rendered and then they replace the
          // '&0', '&1', '&2', '&3'... placeholders that are found within the command's htmlTemplate

          // Return the Latex.matrix() object to the main parser so that it knows to render this
          // particular portion of latex in this fashion
          return Parser.succeed(cmd);
      });


    //var matrixCommand =
    //  regex(/^\\begin{matrix}/)
    //  .then(regex(/^(.*?)\\end{matrix}/))
    //  .then(function (a) {
    //        var cmd = LatexCmds.matrix();
    //        var blocks = [];
    //        var LatexBlocks = [];
    //        var rows;

    //        var findmatrix = function(Latex) {
    //            var sregex = /(\\begin{matrix}.*?\\end{matrix})/g;
    //            var eregex = /(\\begin{matrix}.*?\\end{matrix})/g;
    //            return Latex.match(regex);
    //        };

    //        var getHtml = function() {

    //        };



    //      // Strip out the trailing command (\end{matrix})
    //      var content = a.replace(/\\end{matrix}/, '');
    //      var i = 0;
    //      var ltxcmd = a.length;
    //      var strBuff = '';

    //      var match = findmatrix(a);
    //      while (match) {
    //          LatexBlocks.push(strBuff);
    //          match = findmatrix(match[1]);
    //      }

    //      var match = findmatrix(a);
    //      while (i < ltxcmd) {
    //          if (match.index == i) {
    //              if (strBuff.length > 0) {
    //                  LatexBlocks.push(strBuff);
    //                  strBuff = '';
    //              }
    //              a = a.slice(match.index, (match[0].length + match.index));
    //              match = findmatrix(match[1]);
                  
    //          }
    //          else {
    //          }
    //          strBuff = strBuff + a[i];
    //          a.substring(1);
    //          i++;
    //      }

    //      //var strBuff = '';
    //      //var i = 0;
    //      //var ltxcmd = a.length;
    //      //while (strBuff.length < ltxcmd) {
    //      //    strBuff = strBuff + a.substring(1);
              
    //      //    //var match = findmatrix(a);
    //      //    //if (match) {
    //      //    //    if (strBuff.length > 0)
    //      //    //        LatexBlocks.push(strBuff);
    //      //    //    LatexBlocks
    //      //    //    while (findmatrix(match[0])) {

    //      //    //    }
    //      //    //}
    //      //    //else {

    //      //    //}

    //      //    //if (i === match.index) {
    //      //    //    if (strBuff.length > 0)
    //      //    //        LatexBlocks.push(strBuff);

    //      //    //    //var block = latexMathParser.parse(match[0]);
    //      //    //    LatexBlocks.push(a.substring(match.index, match[0].length + match.index));

    //      //    //    strBuff = '';

    //      //    //    i = i + match[0].length;
    //      //    //}
    //      //    //else {
    //      //    //    strBuff = strBuff + a[i];
    //      //    //    i++;
    //      //    //}

    //      //}
    //      //if (strBuff.length > 0)
    //      //    LatexBlocks.push(strBuff);

    //      //var regex = /\\begin{matrix}(.*?)\\end{matrix}/g;
    //      //var match = regex.exec(a);
    //      //if (match) {
    //      //    var matrixstart = match.index;
    //      //    var matrixleng = match[0].length;
              
           
              
    //      //  }

    //      //\begin{matrix}1&3&\begin{matrix}3\\3\\3\end{matrix}\end{matrix}33
          
    //      //var regex = /\\begin{matrix}(.*?)\\end{matrix}/g;
    //      //var match = regex.exec(a);
    //      //if (match) {
    //      //    LatexBlocks.push(a.replace(match[0], ''));
    //      //    var block = latexMathParser.parse(match[0]);
    //      //    LatexBlocks.push(block);
    //      //}


    //      // Retrieve the matrix command
          
          
          
    //      if (LatexBlocks.length >0) {
    //          rows = LatexBlocks[0].split('\\\\');
    //          for (var i = 0; i < rows.length; i++) {
    //              // We have a row, now split it into its respective columns
    //              var columns = rows[i].split('&');
    //              for (var a = 0; a < columns.length; a++) {
    //                  // Parse the individual block, this block may contain other more complicated commands
    //                  // like a square root, we delegate the parsing of this to the Parser object. It returns
    //                  // a MathElement block object which is the object representation of the formula.
                      
    //                  if (columns[a].length > 0)
    //                      blocks.push(latexMathParser.parse(columns[a]));
    //                  else {
    //                      var block = latexMathParser.parse(LatexBlocks[1]);
    //                      blocks.push(block);
    //                  }
    //                  //var block = latexMathParser.parse(columns[a]);
    //                  //blocks.push(block);
    //              }
    //          }
    //          MatrixSize(rows.length, columns.length);
    //      }
    //      else {
    //          rows = content.split('\\\\');
    //          for (var i = 0; i < rows.length; i++) {
    //              // We have a row, now split it into its respective columns
    //              var columns = rows[i].split('&');
    //              for (var a = 0; a < columns.length; a++) {
    //                  // Parse the individual block, this block may contain other more complicated commands
    //                  // like a square root, we delegate the parsing of this to the Parser object. It returns
    //                  // a MathElement block object which is the object representation of the formula.
    //                  var block = latexMathParser.parse(columns[a]);
    //                  blocks.push(block);
    //              }
    //          }
    //          // Tell our Latex.matrix command how big our matrix is, recall that MatrixSize is simply an
    //          // alias for LatexCmds.matrix.setSize
    //          MatrixSize(rows.length, columns.length);

    //          //// Attach the child blocks (each element of the matrix) to the parent matrix object
    //          //cmd.blocks = blocks;
    //          //for (var i = 0; i < blocks.length; i += 1) {
    //          //    blocks[i].adopt(cmd, cmd.ends[R], 0);
    //          //}
    //      }
    //      //for (var i = 0; i < rows.length; i++) {
    //      //    // We have a row, now split it into its respective columns
    //      //    var columns = rows[i].split('&');
    //      //    for (var a = 0; a < columns.length; a++) {
    //      //        // Parse the individual block, this block may contain other more complicated commands
    //      //        // like a square root, we delegate the parsing of this to the Parser object. It returns
    //      //        // a MathElement block object which is the object representation of the formula.
    //      //        var block = latexMathParser.parse(columns[a]);
    //      //        blocks.push(block);
    //      //    }
    //      //}

    //      //// Tell our Latex.matrix command how big our matrix is, recall that MatrixSize is simply an
    //      //// alias for LatexCmds.matrix.setSize
    //      //MatrixSize(rows.length, columns.length);

    //      //// Attach the child blocks (each element of the matrix) to the parent matrix object
    //      cmd.blocks = blocks;
    //      for (var i = 0; i < blocks.length; i += 1) {
    //          blocks[i].adopt(cmd, cmd.ends[R], 0);
    //      }
    //      // The block elements attached to a command are each rendered and then they replace the
    //      // '&0', '&1', '&2', '&3'... placeholders that are found within the command's htmlTemplate

    //      // Return the Latex.matrix() object to the main parser so that it knows to render this
    //      // particular portion of latex in this fashion
    //      cmd.htmlTemplate = 'Hello';
    //      return Parser.succeed(cmd);
    //  })
    //;
    // When giving invalid LaTeX, ensure that the equation doesn't dissapear
    var unknown =
      regex(/^[\\|_|\^|{]((?!right))/).then(function (a) {
          return Parser.succeed(LatexCmds.blank());
      })
    ;

    // Color command
    var colorCommand =
      regex(/^\\color{([a-zA-Z]*)}{([^}]*)}/)
      .then(function (a) {
          var cmd = Color();

          var regex = /^\\color{([a-zA-Z]*)}{([^}]*)}/;
          var match = regex.exec(a);

          var block = latexMathParser.parse(match[2]);
          cmd.blocks = [];
          cmd.blocks.push(block);
          cmd.blocks[0].adopt(cmd, cmd.ends[R], 0);

          cmd.color = match[1];

          cmd.htmlTemplate =
          '<span class="non-leaf" style="color:' + match[1] + '">'
          + '<span>&0</span>'
          + '</span>';

          return Parser.succeed(cmd);
      })
    ;


    var command = matrixCommand
        .or(LeftRightCommand)
      .or(colorCommand)
       .or(controlSequence)
       .or(variable)
       .or(symbol)
       .or(unknown)
    ;

    // Parsers yielding MathBlocks
    var mathGroup = string('{').then(function () { return mathSequence; }).skip(string('}'));
    var mathBlock = optWhitespace.then(mathGroup.or(command.map(commandToBlock)));
    var mathSequence = mathBlock.many().map(joinBlocks).skip(optWhitespace);

    var optMathBlock =
      string('[').then(
        mathBlock.then(function (block) {
            return block.join('latex') !== ']' ? succeed(block) : fail();
        })
        .many().map(joinBlocks).skip(optWhitespace)
      ).skip(string(']'))
    ;

    var latexMath = mathSequence;

    latexMath.block = mathBlock;
    latexMath.optBlock = optMathBlock;
    return latexMath;
})();