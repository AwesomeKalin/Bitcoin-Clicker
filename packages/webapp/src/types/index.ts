export interface Upgrade {
  id: number
  name: string
  cost: number
  effect: 'clickValue' | 'perSecond'
  amount: number
  purchased: number
}
