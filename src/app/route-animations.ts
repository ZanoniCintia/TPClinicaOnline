// src/app/route-animations.ts
import {
  trigger,
  transition,
  style,
  query,
  group,
  animate
} from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({ position: 'absolute', width: '100%' })
      ], { optional: true }),

      group([
        query(':enter', [
          style({ transform: 'translateX(100%)' }),
          animate('300ms ease-out', style({ transform: 'translateX(0%)' }))
        ], { optional: true }),

        query(':leave', [
          style({ transform: 'translateX(0%)' }),
          animate('300ms ease-out', style({ transform: 'translateX(-100%)' }))
        ], { optional: true }),
      ])
    ])
  ]);
