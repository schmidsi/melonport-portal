import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';


export const Portfolios = new Mongo.Collection('portfolios');


if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('portfolios', function portfoliosPublication() {
    return Portfolios.find({
      $or: [
        { private: { $ne: true } },
        { managerAddress: this.userId },
      ],
    });
  });
}


Meteor.methods({
  'portfolios.insert'(address, name, managerAddress, managerName, sharePrice, notional, intraday, mtd, ytd) {
    check(address, String);
    check(name, String);
    check(managerAddress, String);
    check(managerName, String);
    check(sharePrice, Number);
    check(notional, Number);
    check(intraday, Number);
    check(mtd, Number);
    check(ytd, Number);

    Portfolios.insert({
      address,
      name,
      managerAddress,
      managerName,
      sharePrice,
      notional,
      intraday,
      mtd,
      ytd,
      delta: "±0.0",
      username: 'N/A',
      createdAt: new Date(),
    });
  },
  'portfolios.remove'(portfolioId) {
    check(portfolioId, String);

    const portfolio = Portfolios.findOne(portfolioId);

    // Only the owner can delete it
    // TODO assert portflio address
    // if (portfolio.owner !== Meteor.userId())
    //   throw new Meteor.Error('not-authorized');

    Portfolios.remove(portfolioId);
  },
  'portfolios.setChecked'(portfolioId, setChecked) {
    check(portfolioId, String);
    check(setChecked, Boolean);

    const portfolio = Portfolios.findOne(portfolioId);
    if (portfolio.private && portfolio.owner !== Meteor.userId()) {
      // If the portfolio is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Portfolios.update(portfolioId, { $set: { checked: setChecked } });
  },
  'portfolios.setPrivate'(portfolioId, setToPrivate) {
    check(portfolioId, String);
    check(setToPrivate, Boolean);

    const portfolio = Portfolios.findOne(portfolioId);

    // Make sure only the portfolio owner can make a portfolio private
    if (portfolio.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Portfolios.update(portfolioId, { $set: { private: setToPrivate } });
  },
  'portfolios.setSharePrice'(portfolioId, setToSharePrice) {
    check(portfolioId, String);
    check(setToSharePrice, Number);

    Portfolios.update(portfolioId, { $set: { sharePrice: setToSharePrice } });
  },
  'portfolios.setNotional'(portfolioId, setToNotional) {
    check(portfolioId, String);
    check(setToNotional, Number);

    Portfolios.update(portfolioId, { $set: { notional: setToNotional } });
  },
});