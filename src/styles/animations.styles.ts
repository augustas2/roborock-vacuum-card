import { css } from 'lit';

export const animationStyles = css`
    .cleaning::before {
        animation: state-glow 2.4s ease-in-out infinite;
    }
    .returning::before {
        animation: state-glow 2.8s ease-in-out infinite;
    }
    :is(.paused, .error) .vacuum-image {
        opacity: 0.52;
    }
    .state-indicator {
        animation: state-indicator-pulse 2.2s ease-in-out infinite;
    }

    @keyframes state-glow {
        0%,
        100% {
            opacity: 0.08;
            transform: scale(0.88);
        }
        50% {
            opacity: 0.28;
            transform: scale(1);
        }
    }

    @keyframes state-indicator-pulse {
        0%,
        100% {
            box-shadow: 0 0 0 7px
                color-mix(in srgb, var(--state-indicator-color, #9e9e9e) 32%, transparent);
            transform: scale(0.96);
        }
        50% {
            box-shadow: 0 0 0 12px
                color-mix(in srgb, var(--state-indicator-color, #9e9e9e) 72%, transparent);
            transform: scale(1);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .vacuum-image,
        .vacuum-image-wrap::before,
        .state-indicator {
            animation: none;
        }
    }
`;
