export function getstore(params) {
    if (!localStorage[params]) {
      return ''
    } else {
      var str = localStorage[params]
      return str
    }
  }