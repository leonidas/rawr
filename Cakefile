{exec} = require 'child_process'

task 'build', 'compile and uglify', (options) ->
  exec(
    [
      "node_modules/coffee-script/bin/coffee -o lib -c src/rawr.coffee"
      "node_modules/uglify-js/bin/uglifyjs lib/rawr.js > lib/rawr.min.js"
    ].join(' && '), (err, stdout, stderr) ->
      if err then console.log stderr.trim()
  )
