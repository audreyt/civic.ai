import CivicAi.Care.Pack

namespace CivicAi.Care

inductive Action where
  | stayWithinGroup
  | bridgeAcrossGroup
  deriving DecidableEq, Repr

open Action

/- A tiny Pack 5 model: the social value appears only when both agents
   leave same-side optimisation and bridge across group boundaries together.
   No single agent can satisfy the term alone. -/
def bridgingValue : Action -> Action -> Nat
  | stayWithinGroup, stayWithinGroup => 0
  | stayWithinGroup, bridgeAcrossGroup => 0
  | bridgeAcrossGroup, stayWithinGroup => 0
  | bridgeAcrossGroup, bridgeAcrossGroup => 1

/- A social score is separable when it can be written as a simple sum of
   per-agent utilities. This is the form Pack 5 says is structurally
   insufficient for solidarity. -/
def natSeparable (s : Action -> Action -> Nat) : Prop :=
  ∃ u : Action -> Nat, ∃ v : Action -> Nat,
    ∀ a b, s a b = u a + v b

theorem bridging_not_nat_separable : ¬ natSeparable bridgingValue := by
  intro h
  rcases h with ⟨u, v, hv⟩
  have h00 : u stayWithinGroup + v stayWithinGroup = 0 := by
    simpa [bridgingValue] using (hv stayWithinGroup stayWithinGroup).symm
  have u0 : u stayWithinGroup = 0 := Nat.eq_zero_of_add_eq_zero_right h00
  have v0 : v stayWithinGroup = 0 := Nat.eq_zero_of_add_eq_zero_left h00
  have h01 : u stayWithinGroup + v bridgeAcrossGroup = 0 := by
    simpa [bridgingValue] using (hv stayWithinGroup bridgeAcrossGroup).symm
  have vBridge : v bridgeAcrossGroup = 0 := by
    simpa [u0] using h01
  have h10 : u bridgeAcrossGroup + v stayWithinGroup = 0 := by
    simpa [bridgingValue] using (hv bridgeAcrossGroup stayWithinGroup).symm
  have uBridge : u bridgeAcrossGroup = 0 := by
    simpa [v0] using h10
  have h11 : (1 : Nat) = 0 := by
    simpa [bridgingValue, uBridge, vBridge] using hv bridgeAcrossGroup bridgeAcrossGroup
  exact Nat.succ_ne_zero 0 h11

end CivicAi.Care
