(function ($) {

    $.fn.inlineEdit = function (options) {

        // define some options with sensible default values
        // - hoverClass: the css classname for the hover style
        options = $.extend({
            hoverClass: 'hover'
        }, options);

        return $.each(this, function () {

            // define self container
            var self = $(this);

            // create a value property to keep track of current value
            self.value = self.text();

            // bind the click event to the current element, in this example it's span.editable
            self.bind('click', function () {

                self
                    // populate current element with an input element and add the current value to it
                    .html('<input type="text" value="' + self.value + '" style="width: ' + self.width() + 3 + ';">')
                    // select this newly created input element
                    .find('input')
                        // bind the blur event and make it save back the value to the original span area
                        // there by replacing our dynamically generated input element
                        .bind('blur', function (event) {
                            self.value = $(this).val();
                            self.text(self.value);
                        })
                        // give the newly created input element focus
                        .focus();

            })
            // on hover add hoverClass, on rollout remove hoverClass
            .hover(
                function () {
                    self.addClass(options.hoverClass);
                },
                function () {
                    self.removeClass(options.hoverClass);
                }
            );
        });
    }

})(jQuery);