+function ($) {
  'use strict';

  var GridLottery = function(element, options) {
    console.log('options', options)
    this.$container = $(element)
    this.items = this.$container.find('.item').sort(function(a, b) {
      return $(a).data('sort') - $(b).data('sort')
    })
    this.options = options
    this.cycle = this.options.rounds * this.items.length
    this.pos = -1
    this.timer = null

    this.reset()
  }

  GridLottery.DEFAULTS = {
    rounds: 2,
    delay: 500,
  }

  GridLottery.prototype.reset = function() {
    this.times = 0
    this.step = -20
    this.duration = 200
    this.target = null
    this.brakePos = this.pos
    this.$container.one('click.tzj.gridlottery', '[data-control="start"]', $.proxy(this.start, this))
  }

  GridLottery.prototype.start = function() {
    this.timer = setTimeout($.proxy(this.roll, this), this.options.delay)
    this.$container.trigger($.Event('start.tzj.gridlottery'))
  };

  GridLottery.prototype.setPrize = function(prizeIndex) {
    var itemCount = this.items.length
    var brakePos = (this.times > this.cycle ? this.pos : this.brakePos)
    clearTimeout(this.timer)
    if (prizeIndex <= brakePos) prizeIndex += itemCount
    var d = prizeIndex - brakePos
    if (d <= itemCount / 2) d += itemCount
    this.step = 500 / d
    this.target = d + (this.times > this.cycle ? this.times : this.cycle)
    this.roll()
  };

  GridLottery.prototype.move = function() {
    var itemCount = this.items.length
    var current = this.pos
    var next = (current + 1 < itemCount ? current + 1 : 0)
    $(this.items.eq(current)).removeClass('active') 
    $(this.items.eq(next)).addClass('active')
    this.times++
    this.pos = next
  }

  GridLottery.prototype.stop = function() {
    clearTimeout(this.timer)
    this.reset()
    this.$container.trigger($.Event('stop.tzj.gridlottery'))
  };

  GridLottery.prototype.roll = function() {
    this.move()
    if (this.times <= this.cycle) {
      this.duration -= 20
    } else {
      if (this.times === this.target) return this.stop()
      this.duration += this.step
    }
    if (this.duration <= 60) this.duration = 60
    this.timer = setTimeout($.proxy(this.roll, this), this.duration)
  }

  function Plugin(option) {
    var args = Array.prototype.slice.call(arguments, 1)
    return this.each(function () {
      var $this   = $(this)
      var obj     = $this.data('tzj.gridlottery')
      var options = $.extend({}, GridLottery.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : null
      if (!obj) $this.data('tzj.gridlottery', (obj = new GridLottery(this, options)))
      if (action) obj[action].apply(obj, args)
    })
  }

  var old = $.fn.gridlottery

  $.fn.gridlottery             = Plugin
  $.fn.gridlottery.Constructor = GridLottery


  // NO CONFLICT
  // ====================

  $.fn.gridlottery.noConflict = function () {
    $.fn.carousel = old
    return this
  }

  $(window).on('load', function () {
    $('[data-ride="gridlottery"]').each(function () {
      var $target = $(this)
      Plugin.call($target, $target.data())
    })
  })

}(jQuery)