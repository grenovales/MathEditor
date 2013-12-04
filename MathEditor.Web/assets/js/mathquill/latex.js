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
        .or(regex(/^[\\,]/).result('thinspace'))
        .or(regex(/^[\\;]/).result('thickspace'))
        .or(regex(/^[\\:]/).result('mediumspace'))
        .or(any)
      )).then(function (ctrlSeq) {
          //var result = regex(/^[\\,|\\\:]/).then;

          var cmdKlass = LatexCmds[ctrlSeq];
          if (cmdKlass) {
              return cmdKlass(ctrlSeq).parser();
          }
          else {
              return fail('unknown command: \\' + ctrlSeq);
          }

      })
    ;

    var matrixCommand =
      regex(/^\\begin{matrix}/)
      .then(regex(/^(.*)\\end{matrix}/))
      .then(function (a) {
          // Strip out the trailing command (\end{matrix})
          var content = a.replace(/\\end{matrix}/, '');

          // Retrieve the matrix command
          var cmd = LatexCmds.matrix();

          // Parse the individual blocks within the matrix
          // Refer to http://en.wikibooks.org/wiki/LaTeX/Mathematics to learn more about the LaTeX
          // matrix notation.
          // Basically rows are delimited by double backslashes and columns by ampersands
          var blocks = [];
          var rows = content.split('\\\\');
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
      })
    ;

    var command = controlSequence
      .or(matrixCommand)
      .or(variable)
      .or(symbol)
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