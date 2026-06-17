/// How a pad responds to press and release. The runtime counterpart of
/// `format::PadMode` (which is the on-disk form).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum PlayMode {
    /// Play once on press; release does nothing.
    #[default]
    OneShot,
    /// Loop while the pad is held; stop on release.
    HoldLoop,
    /// Press toggles a loop on; press again toggles it off.
    ToggleLoop,
}
