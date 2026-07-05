namespace CivicAi.Care

inductive Pack where
  | attentiveness
  | responsibility
  | competence
  | responsiveness
  | solidarity
  | symbiosis
  deriving DecidableEq, Repr

namespace Pack

def number : Pack -> Nat
  | attentiveness => 1
  | responsibility => 2
  | competence => 3
  | responsiveness => 4
  | solidarity => 5
  | symbiosis => 6

def slug : Pack -> String
  | attentiveness => "1"
  | responsibility => "2"
  | competence => "3"
  | responsiveness => "4"
  | solidarity => "5"
  | symbiosis => "6"

def enName : Pack -> String
  | attentiveness => "Attentiveness"
  | responsibility => "Responsibility"
  | competence => "Competence"
  | responsiveness => "Responsiveness"
  | solidarity => "Solidarity"
  | symbiosis => "Symbiosis"

def twName : Pack -> String
  | attentiveness => "覺察力"
  | responsibility => "負責力"
  | competence => "勝任力"
  | responsiveness => "回應力"
  | solidarity => "團結力"
  | symbiosis => "共生力"

end Pack

inductive Layer where
  | careCycle
  | field
  | membrane
  deriving DecidableEq, Repr

def layer : Pack -> Layer
  | Pack.attentiveness => Layer.careCycle
  | Pack.responsibility => Layer.careCycle
  | Pack.competence => Layer.careCycle
  | Pack.responsiveness => Layer.careCycle
  | Pack.solidarity => Layer.field
  | Pack.symbiosis => Layer.membrane

def allPacks : List Pack := [Pack.attentiveness, Pack.responsibility, Pack.competence, Pack.responsiveness, Pack.solidarity, Pack.symbiosis]

theorem allPacks_length : allPacks.length = 6 := rfl

def cycleNext : Pack -> Pack
  | Pack.attentiveness => Pack.responsibility
  | Pack.responsibility => Pack.competence
  | Pack.competence => Pack.responsiveness
  | Pack.responsiveness => Pack.attentiveness
  | Pack.solidarity => Pack.solidarity
  | Pack.symbiosis => Pack.symbiosis

theorem care_cycle_returns_to_attentiveness : cycleNext (cycleNext (cycleNext (cycleNext Pack.attentiveness))) = Pack.attentiveness := rfl

inductive HandoffKind where
  | cycle
  | chord
  | field
  | membrane
  deriving DecidableEq, Repr

structure Handoff where
  source : Pack
  target : Pack
  kind : HandoffKind
  cargo : String
  deriving Repr

def handoffs : List Handoff := [
  { source := Pack.attentiveness, target := Pack.responsibility, kind := HandoffKind.cycle, cargo := "who, what, why + rights flags" },
  { source := Pack.responsibility, target := Pack.competence, kind := HandoffKind.cycle, cargo := "specs, SLAs, brakes" },
  { source := Pack.competence, target := Pack.responsiveness, kind := HandoffKind.cycle, cargo := "traces, incidents" },
  { source := Pack.responsiveness, target := Pack.attentiveness, kind := HandoffKind.cycle, cargo := "new needs restart the cycle" },
  { source := Pack.responsibility, target := Pack.responsiveness, kind := HandoffKind.chord, cargo := "remedies wired before launch" },
  { source := Pack.attentiveness, target := Pack.competence, kind := HandoffKind.chord, cargo := "caution areas become safe-to-fail trials" },
  { source := Pack.attentiveness, target := Pack.solidarity, kind := HandoffKind.field, cargo := "bridging map hands over the terrain" },
  { source := Pack.responsibility, target := Pack.solidarity, kind := HandoffKind.field, cargo := "portability + exit clauses in every contract" },
  { source := Pack.responsiveness, target := Pack.solidarity, kind := HandoffKind.field, cargo := "repair culture builds cross-org trust" },
  { source := Pack.solidarity, target := Pack.symbiosis, kind := HandoffKind.membrane, cargo := "treaties, IDs, portability make symbiosis feasible" },
  { source := Pack.competence, target := Pack.symbiosis, kind := HandoffKind.membrane, cargo := "competent, responsive systems earn stewardship" },
  { source := Pack.symbiosis, target := Pack.attentiveness, kind := HandoffKind.membrane, cargo := "retired systems gift maps, evals, records" },
  { source := Pack.symbiosis, target := Pack.responsibility, kind := HandoffKind.membrane, cargo := "bounds and sunsets are contractual" }
]

theorem handoffs_length : handoffs.length = 13 := rfl

end CivicAi.Care
