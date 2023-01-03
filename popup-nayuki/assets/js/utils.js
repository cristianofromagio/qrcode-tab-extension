/**
 * refs:
 *  - https://web.mit.edu/jwalden/www/isArray.html
 *  -
 */


const
  /**
   * Returns first Element to satisfy selector.
   *
   * @param {String} q - Valid CSS query selector.
   * @param {Element} [ctx=document] - Context in which to query for.
   * @returns {(Element|null)} Returns first matching element or null if none.
   */
  $ = function (q, ctx = document) {
    return ctx.querySelector(q)
  },
  /**
   * Returns first Element to satisfy selector.
   *
   * @param {String} q - Valid CSS query selector.
   * @param {Element} [ctx=document] - Context in which to query for.
   * @returns {NodeList} Returns NodeList with all matching elements or empty NodeList if none.
   */
  $$ = function (q, ctx = document) {
    return ctx.querySelectorAll(q)
  },
  /**
   * Creates an element.
   *
   * @param {String} t - Valid HTML tag.
   * @returns {Element} Returns created Element.
   */
  $create = function (t) {
    return document.createElement(t);
  },

  /**
   * Set values to an element property recursively.
   *
   * @param {(Element|NodeList)} e - Element or NodeList object to set values to.
   * @param {String|Array} p - Element property, can use nested dot notation (ie. "style.color").
   * @param {*|Array} v - Value to set to the element property.
   */
  $fill = function (e, p, v) {
    if (e) {
      // returned by querySelectorAll
      if (e instanceof NodeList) {
        e.forEach((el) => $fill(el, p, v));
      }

      if (Array.isArray(p) && Array.isArray(v)) {
        if (p.length === v.length) {
          p.forEach((_, i) => $fill(e, p[i], v[i]));
        }
        // arrays diff length
        return;
      }

      // if contains '.' it's "nested"
      if (p.includes('.')) {
        let s = p.split('.');
        // shift() returns and removes the first element from the array (mutating method)
        // it works recursively because objects are "passed by reference" (https://javascript.info/object-copy#summary)
        $fill(e[s.shift()], s.join('.'), v);
      }

      e[p] = v;
    }
  };
