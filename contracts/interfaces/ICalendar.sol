// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @author ERC20EXP <erc20exp@protonmail.com>

interface ICalendar {
    //events
    event BlockProducedPerYearUpdated(uint256 blockPerYearOld, uint256 blockPerYearNew);
    event ExpirationPeriodUpdated(uint256 expirePeriodOld, uint256 expirePeriodNew);

    //errors

    //function
    function blockPerEra() external view returns (uint40);
    function blockPerSlot() external view returns (uint40);
    function currentEra() external view returns (uint256);
    function currentEraAndSlot() external view returns (uint256 era, uint8 slot);
    function currentSlot() external view returns (uint8);
    function expirationPeriodInBlockLength() external view returns (uint40);
    function expirationPeriodInSlotLegth() external view returns (uint8);
    function expirationPeriodInEraLength() external view returns (uint8 era, uint8 slot);
    function pagination() external view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot);
    function slotPerEra() external view returns (uint8);
}
