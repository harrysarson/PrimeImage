module StateSpec exposing (tests)

import Random.Pcg as Random

import Test exposing (describe, test, fuzz, fuzz2, Test)
import Fuzz exposing (Fuzzer)
import Expect

import State exposing (initialState, update)
import Types
import Config
import ToNumberConfig.State
import ToNumberConfig.Types
import Ports
import Task
import Fuzzers.Basic exposing (model, imageNumber)
import Fuzzers.ToNumberConfig

tests : Test
tests =
    describe "State"
        [ describe "initialState"
            [ test ".stage is 0" <|
                \() -> initialState
                  |> Tuple.first
                  |> .stage
                  |> Expect.equal 0
            , test ".image is Nothing" <|
                \() -> initialState
                  |> Tuple.first
                  |> .image
                  |> Expect.equal Nothing
            , test ".nonPrime is Nothing" <|
                \() -> initialState
                  |> Tuple.first
                  |> .nonPrime
                  |> Expect.equal Nothing
            , test ".toNumberConfig is equal to ToNumberConfig.State.initialState" <|
                \() -> initialState
                  |> Tuple.first
                  |> .toNumberConfig
                  |> Expect.equal ToNumberConfig.State.initialState
            , test ".initialState produces the setInitialValues command" <|
                \() -> initialState
                  |> Tuple.second
                  |> Expect.equal (Cmd.batch [ Ports.setInitialValues ToNumberConfig.State.initialState ])
            ]
        , describe "Update State"
            [ describe "ChangeState message"
                [ fuzz2
                      model
                      (Fuzz.intRange 0 (Config.maxStage - 1))
                      "change to an existing state"
                      <| \model newStage ->
                        let
                          change = newStage - model.stage
                        in
                          update (Types.ChangeStage change) model
                            |> Tuple.first
                            |> Expect.equal { model | stage = newStage }
                , fuzz2
                      model
                      (Fuzz.intRange Random.minInt -1)
                      "change that is too small"
                      <| \model newStage ->
                        let
                          change = newStage - model.stage
                        in
                          update (Types.ChangeStage change)  model
                            |> Tuple.first
                            |> Expect.equal { model | stage = 0 }
                , fuzz2
                      model
                      (Fuzz.intRange Config.maxStage Random.maxInt)
                      "change that is too large"
                      <| \model newStage ->
                        let
                          change = newStage - model.stage
                        in
                          update (Types.ChangeStage change) model
                            |> Tuple.first
                            |> Expect.equal { model | stage = Config.maxStage }
                ]
            ,  describe "ImageSelected message"
                [ fuzz
                      model
                      "Should not change state"
                      <| \model -> update Types.ImageSelected model
                            |> Tuple.first
                            |> Expect.equal model
                ]
            ,  describe "ImageRead message"
                [ fuzz2
                      model
                      (Fuzz.constant image)
                      "ImageSelected message does not change state"
                      <| \model newImage -> update (Types.ImageRead newImage) model
                        |> Tuple.first
                        |> Expect.equal { model | image = Just newImage }
                ]
            ,  describe "UpdateNumberConfig message"
                [ fuzz2
                      model
                      updateNumberConfigMsgFuzz
                      "ImageSelected message does not change state"
                      <| \model updateNumberConfigMsg -> update (Types.UpdateNumberConfig updateNumberConfigMsg) model
                        |> Tuple.first
                        |> Expect.equal
                            { model
                            | toNumberConfig = ToNumberConfig.State.update updateNumberConfigMsg model.toNumberConfig
                            }
                ]
            ,  describe "NonPrimeGenerated message"
                [ fuzz
                      model
                      "ImageSelected message does not change state"
                      <| \model -> update (Types.NonPrimeGenerated imageNumber) model
                        |> Tuple.first
                        |> Expect.equal
                            { model
                            | nonPrime = Just imageNumber
                            }
                ]
            ]
        ]

intOutsideRange : Int -> Int -> Fuzzer Int
intOutsideRange lo hi =
    if hi < lo then
        Err <| "intOutsideRange was given a lower bound of " ++ toString lo ++ " which is greater than the upper bound, " ++ toString hi ++ "."
    else
        Fuzz.frequency
            [ ( toFloat (lo - Random.minInt), Fuzz.intRange Random.minInt (lo - 1) )
            , ( toFloat (Random.maxInt - hi), Fuzz.intRange (hi + 1) Random.maxInt )
            ]

updateNumberConfigMsgFuzz =
    Fuzz.oneOf
        [ Fuzz.int
            |> Fuzz.map toString
            |> Fuzz.map ToNumberConfig.Types.SetWidth
        , Fuzz.int
            |> Fuzz.map toString
            |> Fuzz.map ToNumberConfig.Types.SetHeight
        , Fuzz.int
            |> Fuzz.map ToNumberConfig.Types.SetLevel
            |> Fuzz.andMap (Fuzz.int |> Fuzz.map toString)
        ]


image =
    { contents = "https://www.example.com/images/dinosaur.jpg"
    , filename = "example/image.jpg"
    }


imageNumber =
  { width  = 10
  , number = "11012301211101230121110123012111012301211101230121"
  }


debugFunc string f value =
  let
    notUsed = Debug.log string (f value)
  in
    value
