/// A stereo audio frame.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Frame {
    pub left: f32,
    pub right: f32,
}

/// One node in a track's effect chain. Built-in effects and, later, hosted
/// CLAP/VST plugins implement this same trait so they share one chain.
pub trait Effect {
    fn process(&mut self, frame: Frame) -> Frame;
}

/// Linear gain — the simplest effect, here to keep the [`Effect`] seam real
/// and exercised before any plugin host exists.
pub struct Gain {
    pub amount: f32,
}

impl Effect for Gain {
    fn process(&mut self, frame: Frame) -> Frame {
        Frame {
            left: frame.left * self.amount,
            right: frame.right * self.amount,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gain_scales_both_channels() {
        let mut g = Gain { amount: 0.5 };
        let out = g.process(Frame {
            left: 1.0,
            right: -0.4,
        });
        assert_eq!(
            out,
            Frame {
                left: 0.5,
                right: -0.2
            }
        );
    }
}
