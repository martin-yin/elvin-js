import { transportData } from '../core/transportData'
import { getBigVersion, getTimestamp } from '../utils/helpers'
import { variableTypeDetection } from '../utils/is'
import ErrorStackParser from 'error-stack-parser'

export function handleVueError(err: Error, vm, info: string, Vue): void {
  const version = Vue.version
  const stack = ErrorStackParser.parse(err)
  let data = {
    message: `${err.message}`,
    stack: err.stack,
    stack_frames: JSON.stringify(stack) || '',
    happen_time: getTimestamp(),
    error_name: err.name,
    action_type: 'JS_ERROR'
  }

  if (variableTypeDetection.isString(version)) {
    switch (getBigVersion(version)) {
      case 2:
        data = { ...data, ...vue2VmHandler(vm) }
        break
      case 3:
        data = { ...data, ...vue3VmHandler(vm) }
        break
      default:
        return
        break
    }
  }

  transportData.send(data)
}
function vue2VmHandler(vm) {
  let component_name = ''
  if (vm.$root === vm) {
    component_name = 'root'
  } else {
    const name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name
    component_name =
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '')
  }
  return {
    component_name,
    propsData: vm.$options && vm.$options.propsData
  }
}

function vue3VmHandler(vm) {
  let component_name = ''
  if (vm.$root === vm) {
    component_name = 'root'
  } else {
    const name = vm.$options && vm.$options.name
    component_name = name ? 'component <' + name + '>' : 'anonymous component'
  }
  return {
    component_name,
    propsData: vm.$props
  }
}

const RportVue = {
  install(Vue): void {
    Vue.config.errorHandler = function (err: Error, vm: any, info: string): void {
      handleVueError.apply(null, [err, vm, info, Vue])
    }
  }
}

export { RportVue }
