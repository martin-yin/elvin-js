jest.useFakeTimers()
import { getBigVersion, isHttpFail } from '../../packages/utils/helpers'

describe('helpers.ts', () => {
  it('获取大版本号', () => {
    const version = getBigVersion('3.0.1')
    expect(version).toEqual(3)
  })
  describe('ishttpFail', () => {
    it('httpFail', () => {
      expect(isHttpFail(200)).toEqual(false)
      expect(isHttpFail(0)).toEqual(true)
      expect(isHttpFail(400)).toEqual(true)
    })
  })
})
