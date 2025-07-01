import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

export const fadeSlideAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0,
        })
      ], { optional: true }),

      group([
        query(':leave', [
          animate('300ms ease', style({ opacity: 0, transform: 'translateX(50px)' }))
        ], { optional: true }),

        query(':enter', [
          style({ transform: 'translateX(-50px)' }),
          animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
        ], { optional: true })
      ])
    ])
  ]);
