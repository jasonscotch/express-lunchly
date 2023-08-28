/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
          WHERE id=$4`,
        [this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }

  set numGuests(value) {
    if (value < 1) {
      throw new Error('Number of guests must be at least 1');
    }
    this._numGuests = value;
  }
  get numGuests() {
    return this._numGuests;
  }

  set startAt(value) {
    if (!isNaN(value) && value instanceof Date) {
      this._startAt = value;
    } else {
    throw new Error("Start must be a valid date.");
    }
  }  
  get startAt() {
    return this._startAt;
  }

  set customerId(value) {
    if(this._customerId && this._customerId !== value) {
      throw new Error("You cannot change a customer ID.")
    } else {
      this._customerId = value;
    }
  }
  get customerId() {
    return this._customerId;
  }


}


module.exports = Reservation;
